import React, {ChangeEvent, useEffect, useMemo, useState} from 'react';
import './App.css';
import Dashboard from "./Dashboard";
import {
  FIELD_NAME_GL_AGGREGATE_LIMIT,
  PackedPolicyData,
  ProcessorOutput,
  ProcessorStatistics,
  UnpackedPolicyRecord
} from "./types";
import PolicyDisplay from "./PolicyDisplay";

function App() {
  const processor: Worker = useMemo(
    () => new Worker(new URL("./processor.ts", import.meta.url)),
    []
  );

  const [statistics, setStatistics] = useState<ProcessorStatistics | null>()
  const [unpackedPolicies, setUnpackedPolicies] = useState<UnpackedPolicyRecord[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [file, setFile] = useState<File>();

  const es6MapAwareReplacer = (key: string, value: any) => {
    if(value instanceof Map) {
      return Array.from(value).reduce((obj: any, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    } else {
      return value;
    }
  }


  const downloadSortedJSONFile = () => {
    if (unpackedPolicies) {
      const sortedPolicies = unpackedPolicies.sort((a, b) => a.get(FIELD_NAME_GL_AGGREGATE_LIMIT) as number - (b.get(FIELD_NAME_GL_AGGREGATE_LIMIT) as number))
      const outputFileContents = sortedPolicies.map(policy => JSON.stringify(policy, es6MapAwareReplacer)).join('\n')

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(outputFileContents));
      element.setAttribute('download', "sorted-gl-aggregate-limit.jsonl");

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (window.Worker && file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const packedData: PackedPolicyData = JSON.parse(event.target.result as string);
          setFields(packedData.fields);
          processor.postMessage(packedData);
        }
      };

      reader.readAsText(file.slice());

    }
  }, [processor, file]);

  useEffect(() => {
    if (window.Worker) {
      processor.onmessage = (e: MessageEvent<string>) => {
        const output = e.data as unknown as ProcessorOutput
        setStatistics(output.statistics);
        setUnpackedPolicies(output.policies);
      };
    }
  }, [processor, file]);


  return (
    <div>
      <header>
        <h3>Vellum Application Engineer Case Interview</h3>
      </header>
      <main>
        <section>
          <header><h5>Input / Output</h5></header>
          <input type="file" onChange={handleFileChange} name="Input JSON file" />
          {unpackedPolicies.length ? <button onClick={() => downloadSortedJSONFile()}>Download sorted JSON object file</button> : <></>}
        </section>
        <section>
          <header><h5>Statistics</h5></header>
          { !!statistics ? <Dashboard statistics={statistics} /> : (file ? <span>Loading...</span> : <span>Select a file above to calculate statistics</span>)}
        </section>
        <section>
          <header><h5>All policies</h5></header>
          <PolicyDisplay policies={unpackedPolicies} fields={fields} />
        </section>
      </main>
    </div>
  );
}

export default App;
