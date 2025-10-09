import { useState, useEffect } from 'react';
import { getAllPdfs, uploadPdfs } from '../../services/pdfService';

const FileCard = ({ file, onSelect, isSelected }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'border-green-500 bg-green-50';
            case 'processing':
                return 'border-yellow-500 bg-yellow-50';
            case 'failed':
                return 'border-red-500 bg-red-50';
            default:
                return 'bg-white';
        }
    };

    return (
        <div
            onClick={() => file.status === 'completed' && onSelect(file._id)}
            className={`p-4 border rounded-lg ${file.status === 'completed' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                } ${isSelected ? 'bg-indigo-100 border-indigo-500' : getStatusColor(file.status)
                }`}
        >
            <h3 className="font-bold truncate" title={file.fileName}>{file.fileName}</h3>
            <p className="text-sm text-gray-500">PDF • {file.status}</p>
            {file.status === 'processing' && (
                <p className="text-xs text-yellow-600 mt-1">Processing...</p>
            )}
            {file.status === 'failed' && (
                <p className="text-xs text-red-600 mt-1">Failed to process</p>
            )}
        </div>
    );
};

const FileList = ({ selectedFiles, setSelectedFiles, onDone }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch PDFs on component mount
    useEffect(() => {
        fetchPdfs();
    }, []);

    const fetchPdfs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllPdfs();
            setFiles(response.pdfs || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching PDFs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const selectedFilesArray = Array.from(event.target.files);
        if (selectedFilesArray.length === 0) return;

        try {
            setUploading(true);
            setError(null);
            await uploadPdfs(selectedFilesArray);
            // Refresh the file list after upload
            await fetchPdfs();
        } catch (err) {
            setError(err.message);
            console.error('Error uploading PDFs:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleSelect = (fileId) => {
        setSelectedFiles((prev) =>
            prev.includes(fileId)
                ? prev.filter((id) => id !== fileId)
                : [...prev, fileId]
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading files...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Select Files to Study</h2>
                <div>
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload PDFs'}
                    </label>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {files.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No files uploaded yet</p>
                    <label
                        htmlFor="file-upload"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 inline-block"
                    >
                        Upload Your First PDF
                    </label>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {files.map((file) => (
                            <FileCard
                                key={file._id}
                                file={file}
                                onSelect={handleSelect}
                                isSelected={selectedFiles.includes(file._id)}
                            />
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <p>{selectedFiles.length} files selected</p>
                        <button
                            onClick={onDone}
                            disabled={selectedFiles.length === 0}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400 hover:bg-indigo-700"
                        >
                            Done
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FileList;
