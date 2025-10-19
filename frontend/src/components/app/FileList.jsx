import { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import { getAllPdfs } from '../../services/pdfService';

const FileCard = ({ file, onSelect, isSelected }) => {
    return (
        <div
            onClick={() => file.processingStatus === 'ready' && onSelect(file._id)}
            className={`p-4 rounded-lg transition-all cursor-pointer border-2 ${
                file.processingStatus === 'ready' ? 'hover:shadow-md' : 'cursor-not-allowed opacity-60'
            } ${
                isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
        >
            <div className="flex flex-col items-center text-center gap-2">
                <div className="relative">
                    <FileText className={`w-12 h-12 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>
                <span className="text-sm break-words line-clamp-2">{file.filename}</span>
                {file.processingStatus === 'processing' && (
                    <span className="text-xs text-yellow-600">Processing...</span>
                )}
                {file.processingStatus === 'failed' && (
                    <span className="text-xs text-red-600">Failed</span>
                )}
            </div>
        </div>
    );
};

const FileList = ({ selectedFiles, setSelectedFiles, onDone, onRefresh }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (onRefresh) {
            onRefresh(fetchPdfs);
        }
    }, [onRefresh]);

    const handleSelect = (fileId) => {
        setSelectedFiles((prev) =>
            prev.includes(fileId)
                ? prev.filter((id) => id !== fileId)
                : [...prev, fileId]
        );
    };

    const selectedCount = selectedFiles.length;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Loading files...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Files to Study</h1>
                    <p className="text-gray-600">
                        Choose from your uploaded files to get started
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {files.length === 0 ? (
                    <div className="text-center py-12 mb-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-2 font-medium">No files uploaded yet</p>
                        <p className="text-sm text-gray-500">
                            Use the "Upload files" button in the sidebar to add files
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        {files.map((file) => (
                            <FileCard
                                key={file._id}
                                file={file}
                                onSelect={handleSelect}
                                isSelected={selectedFiles.includes(file._id)}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-6">
                    <p className="text-gray-600">
                        <span className="font-semibold text-blue-600 text-lg">{selectedCount}</span>
                        <span> file{selectedCount !== 1 ? 's' : ''} selected</span>
                    </p>
                    <button
                        onClick={onDone}
                        disabled={selectedCount === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileList;
