import {PolicyRecordAttributeType, UnpackedPolicyRecord} from "./types";
import {useState} from "react";

interface PolicyDisplayProps {
  policies: UnpackedPolicyRecord[];
  fields: string[];
}

const PolicyDisplay = ({ policies, fields }: PolicyDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 50;
  const maxPages = Math.ceil(policies.length / itemsPerPage);

  const thisPage: UnpackedPolicyRecord[] = policies.slice(itemsPerPage * currentPage, itemsPerPage * (currentPage + 1) - 1);

  const updateCurrentPage = (offset: number) => {
    const newPage = currentPage + offset;
    if (newPage >= 0 && newPage <= maxPages) {
      setCurrentPage(newPage);
    }
  }

  const renderAttribute = (attr: PolicyRecordAttributeType | undefined) => {
    if (typeof attr == "string") {
      return attr;
    } else if (typeof attr == "number") {
      return new Intl.NumberFormat().format(attr);
    } else if (typeof attr === "boolean") {
      return attr ? 'YES' : 'NO'
    } else {
      return 'N/A'
    }
  }


  const renderPolicy = (policy: UnpackedPolicyRecord) => {
    return fields
      .map(field => policy.get(field)).map(fieldValue => (<td>{renderAttribute(fieldValue)}</td>))
  }

  return (
    <div>
      <table>
        <thead>
        <tr>
          {fields.map(field => (<td>{field}</td>))}
        </tr>
        </thead>
        <tbody>
        {thisPage.map(policy => (<tr>
          {renderPolicy(policy)}
        </tr>))}
        </tbody>
      </table>
      <div>
        <p>Showing page <button onClick={() => updateCurrentPage(-1)}>&lt;</button> {currentPage + 1} <button onClick={() => updateCurrentPage(1)}>&gt;</button> out of {maxPages} pages.</p>
      </div>
    </div>
  )
}

export default PolicyDisplay;