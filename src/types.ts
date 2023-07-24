export type PolicyRecordAttributeType = string | number | boolean
export type UnpackedPolicyRecord = Map<string, PolicyRecordAttributeType>

export interface PackedPolicyData {
  data: string[][];
  fields: string[];
}

export type ProcessorStatistics = Map<string, string | number>
export interface ProcessorOutput {
  statistics: ProcessorStatistics;
  policies: UnpackedPolicyRecord[]
}

export const FIELD_NAME_INSURED_NAME = "Insured name"
export const FIELD_NAME_LOCATION_STATE = "Location State"
export const FIELD_NAME_GL_AGGREGATE_LIMIT = "GL Aggregate Limit"
export const FIELD_NAME_PER_OCCURRENCE_LIMIT = "Per Occurence Limit"
export const FIELD_NAME_BUILDING_COVERAGE_LIMIT = "Building Coverage Limit"
export const FIELD_NAME_COMPLETED_OPS_LIMIT = "Products/Completed Ops limit"
export const FIELD_NAME_HAS_WAIVER_OF_SUBROGATION = "Has Waiver of Subrogation"
export const FIELD_NAME_BUSINESS_PERSONAL_PROPERTY = "Business Personal Property"