import {
  FIELD_NAME_GL_AGGREGATE_LIMIT,
  type PackedPolicyData,
  type ProcessorOutput,
  type ProcessorStatistics,
  type UnpackedPolicyRecord
} from '../types'
import React, { useEffect, useMemo, useState } from 'react'
import Dashboard from './Dashboard'
import FileInput from './FileInput'
import PolicyDisplay from './PolicyDisplay'

const App = () => {
  const processor: Worker = useMemo(
    () => new Worker(new URL('../processor/processor.ts', import.meta.url)),
    []
  )

  const [statistics, setStatistics] = useState<ProcessorStatistics | null>()
  const [unpackedPolicies, setUnpackedPolicies] = useState<UnpackedPolicyRecord[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [file, setFile] = useState<File>()
  const [processing, setProcessing] = useState<boolean>(false)

  const es6MapAwareReplacer = (key: string, value: any) => {
    if (value instanceof Map) {
      return Array.from(value).reduce((obj: any, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
    } else {
      return value
    }
  }

  const downloadSortedJSONFile = () => {
    if (unpackedPolicies.length > 0) {
      const sortedPolicies = unpackedPolicies.sort((a, b) => a.get(FIELD_NAME_GL_AGGREGATE_LIMIT) as number - (b.get(FIELD_NAME_GL_AGGREGATE_LIMIT) as number))
      const outputFileContents = sortedPolicies.map(policy => JSON.stringify(policy, es6MapAwareReplacer)).join('\n')

      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(outputFileContents))
      element.setAttribute('download', 'sorted-gl-aggregate-limit.jsonl')

      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()

      document.body.removeChild(element)
    }
  }

  useEffect(() => {
    if (file != null) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result != null) {
          try {
            const packedData: PackedPolicyData = JSON.parse(event.target.result as string)
            setFields(packedData.fields)
            processor.postMessage(packedData)
          } catch (e) {
            console.error(e)
          }
        }
      }

      setProcessing(true)
      reader.readAsText(file.slice())
    }
  }, [processor, file])

  useEffect(() => {
    processor.onmessage = (e: MessageEvent<string>) => {
      const output = e.data as unknown as ProcessorOutput
      setStatistics(output.statistics)
      setUnpackedPolicies(output.policies)
      setProcessing(false)
    }
  }, [processor, file])

  return (
    <div className="p-10 flex flex-col w-full">
      <div className="flex flex-col flex-wrap content-center">
        <h3 className="font-medium text-xl">Vellum Application Test</h3>
      </div>
      <div className="flex flex-row mt-4 gap-6 w-full justify-around">
        <div className="flex flex-col flex-wrap content-center grow">
          <FileInput onFileSelected={setFile} />
          {processing ? <div className="text-center">Loading</div> : <></>}
        </div>
        <div>
          { (statistics != null) ? <Dashboard statistics={statistics} /> : <></>}
        </div>
        <div>
          {(unpackedPolicies.length > 0)
            ? (
            <button className="px-4 py-2 font-semibold text-sm bg-cyan-500 hover:bg-cyan-700 text-white rounded-full shadow-sm" onClick={() => { downloadSortedJSONFile() }}>
              Download sorted JSON object file
            </button>
              )
            : <></>}
        </div>
      </div>
      <div className="flex flex-col mt-5 justify-around">
        <PolicyDisplay policies={unpackedPolicies} fields={fields} />
      </div>
    </div>
  )
}

export default App
