import { type PolicyRecordAttributeType, type UnpackedPolicyRecord } from '../types'
import React, { useState } from 'react'

interface PolicyDisplayProps {
  policies: UnpackedPolicyRecord[]
  fields: string[]
}

const PolicyDisplay = ({ policies, fields }: PolicyDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(0)

  const itemsPerPage = 20
  const maxPages = Math.ceil(policies.length / itemsPerPage)

  const thisPage: UnpackedPolicyRecord[] = policies.slice(itemsPerPage * currentPage, itemsPerPage * (currentPage + 1) - 1)

  const updateCurrentPage = (offset: number) => {
    const newPage = currentPage + offset
    if (newPage >= 0 && newPage <= maxPages) {
      setCurrentPage(newPage)
    }
  }

  const renderAttribute = (attr: PolicyRecordAttributeType | undefined) => {
    if (typeof attr === 'string') {
      return attr
    } else if (typeof attr === 'number') {
      return new Intl.NumberFormat().format(attr)
    } else if (typeof attr === 'boolean') {
      return attr ? 'YES' : 'NO'
    } else {
      return 'N/A'
    }
  }

  const renderPolicy = (policy: UnpackedPolicyRecord) => {
    return fields
      .map(field => policy.get(field)).map((fieldValue, index) => (<td className="text-right px-3 py-0.5" key={index}>{renderAttribute(fieldValue)}</td>))
  }

  if (policies.length === 0) {
    return <></>
  }

  return (
    <div className="flex flex-col">
      <table className="border-collapse border border-slate-400 bg-white text-sm shadow-sm">
        <thead className="bg-slate-50 font-semibold">
        <tr>
          {fields.map(field => (<th className="border border-slate-300 p-3" key={field}>{field}</th>))}
        </tr>
        </thead>
        <tbody>
        {thisPage.map((policy, index) => (
          <tr className="hover:bg-slate-200" key={index}>
            {renderPolicy(policy)}
          </tr>
        ))}
        </tbody>
      </table>
      <div className="mt-3">
        Showing page
        <button
          className="ml-1 mr-1 px-3 py-0.5 font-semibold text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-sm"
          onClick={() => { updateCurrentPage(-1) }}>
          &lt;
        </button>
        <div className="inline-block w-[40px] text-center">
          {currentPage + 1}
        </div>
        <button
          className="ml-1 mr-1 px-3 py-0.5 font-semibold text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-sm"
          onClick={() => { updateCurrentPage(1) }}>
          &gt;
        </button>
        out of {maxPages} pages
      </div>
    </div>
  )
}

export default PolicyDisplay
