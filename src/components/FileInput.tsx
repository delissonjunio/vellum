import React, { type ChangeEvent } from 'react'

export interface FileInputProps {
  onFileSelected: (file: File) => void
}

const FileInput = ({ onFileSelected }: FileInputProps) => {
  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files != null) {
      onFileSelected(e.target.files[0])
    }
  }

  return <div className="flex max-w-xl">
    <label
      className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
        <span className="flex items-center space-x-2">
            <span className="font-medium text-gray-600">
                Drop a JSON file to ingest, or{' '}
                <span className="text-blue-600 underline">browse</span>
            </span>
        </span>
      <input type="file" name="file_upload" className="hidden" onChange={onFileInputChange} />
    </label>
  </div>
}

export default FileInput
