import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { uploadPdfs } from '../../services/pdfService';

const UploadModal = ({ onClose, onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setError(null);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setUploading(true);
            setError(null);
            await uploadPdfs(selectedFiles);
            onUploadSuccess();
            setSelectedFiles([]);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Upload PDF Files</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <input
                        type="file"
                        id="pdf-upload"
                        multiple
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <label
                        htmlFor="pdf-upload"
                        className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-700 font-medium">Click to select PDF files</p>
                        <p className="text-xs text-gray-500 mt-1">Up to 10 files, max 50MB each</p>
                    </label>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="mb-4 max-h-48 overflow-y-auto">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            Selected Files ({selectedFiles.length})
                        </p>
                        <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center flex-1 min-w-0 gap-2">
                                        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Upload</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
