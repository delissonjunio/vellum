/* eslint-disable no-restricted-globals */
import {
  FIELD_NAME_BUILDING_COVERAGE_LIMIT,
  FIELD_NAME_HAS_WAIVER_OF_SUBROGATION,
  FIELD_NAME_LOCATION_STATE,
  PackedPolicyData, ProcessorOutput,
  UnpackedPolicyRecord
} from "./types";

const unpackPoliciesData = (fields: string[], records: (string | number | boolean)[][]): UnpackedPolicyRecord[] =>
  records.map(contents => new Map(contents.map((fieldContent, index) => [fields[index], fieldContent])))

const groupBy = <K, T extends Map<string, K>,>(records: T[], key: string): Map<string, T[]> =>
  records.reduce(
    (entryMap, e) => entryMap.set(e.get(key) as string, [...entryMap.get(e.get(key) as string) || [], e]),
    new Map<string, T[]>()
  )

const average = (records: number[]) =>
  records.reduce((p, c) => p + c, 0) / records.length

const standardDeviation = (average: number, records: number[]) =>
  Math.sqrt(records.reduce((s, n) => s + (n - average) ** 2, 0) / (records.length - 1))

const withinOneStandardDeviation = (record: number, standardDeviation: number, average: number) =>
  average - standardDeviation <= record && record <= average + standardDeviation


self.onmessage = (e: MessageEvent<string>) => {
  const packedData = e.data as unknown as PackedPolicyData;
  const policies = unpackPoliciesData(packedData.fields, packedData.data)
  const totalNumberOfPolicies = policies.length;
  const stateWithMostPolicies = Array.from(groupBy(policies, FIELD_NAME_LOCATION_STATE).values())
    .map(groupedPolicies => ({count: groupedPolicies.length, state: groupedPolicies[0].get(FIELD_NAME_LOCATION_STATE)}))
    .sort((a, b) => a.count - b.count)[0]?.state as string ?? 'N/A'

  const countPoliciesWithWaiverOfSubrogation = policies.filter(policy => !!policy.get(FIELD_NAME_HAS_WAIVER_OF_SUBROGATION)).length
  const buildingCoverageLimits = policies.map(policy => policy.get(FIELD_NAME_BUILDING_COVERAGE_LIMIT) as number)

  const averageBuildingCoverageLimit = average(buildingCoverageLimits)
  const standardDeviationBuildingCoverageLimit = standardDeviation(averageBuildingCoverageLimit, buildingCoverageLimits);
  const countPoliciesOutLimitsBuildingCoverage =
    buildingCoverageLimits.filter(l => withinOneStandardDeviation(l, standardDeviationBuildingCoverageLimit, averageBuildingCoverageLimit)).length

  const statistics = new Map<string, string | number>();
  statistics.set("Total number of policies", totalNumberOfPolicies);
  statistics.set("State with most policies", stateWithMostPolicies);
  statistics.set("# of policies with a waiver of subrogation", countPoliciesWithWaiverOfSubrogation);
  statistics.set("Average building coverage limit", averageBuildingCoverageLimit);
  statistics.set("# of policies above over one standard deviation from the average building coverage limit", countPoliciesOutLimitsBuildingCoverage);

  const output: ProcessorOutput = {
    statistics,
    policies
  }
  self.postMessage(output);
};

export {};
