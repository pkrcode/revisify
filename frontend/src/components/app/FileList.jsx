
const FileCard = ({ file, onSelect, isSelected }) => (
    <div
        onClick={() => onSelect(file.id)}
        className={`p-4 border rounded-lg cursor-pointer ${isSelected ? 'bg-indigo-100 border-indigo-500' : 'bg-white'
            }`}
    >
        <h3 className="font-bold">{file.name}</h3>
        <p className="text-sm text-gray-500">{file.type}</p>
    </div>
);

const FileList = ({ selectedFiles, setSelectedFiles, onDone }) => {
    // Dummy data for files
    const files = [
        { id: 1, name: 'Introduction to AI.pdf', type: 'PDF' },
        { id: 2, name: 'History of Ancient Rome.docx', type: 'DOCX' },
        { id: 3, name: 'Calculus Cheat Sheet.pdf', type: 'PDF' },
        { id: 4, name: 'Organic Chemistry Notes.txt', type: 'TXT' },
    ];

    const handleSelect = (fileId) => {
        setSelectedFiles((prev) =>
            prev.includes(fileId)
                ? prev.filter((id) => id !== fileId)
                : [...prev, fileId]
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Select Files to Study</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                    <FileCard
                        key={file.id}
                        file={file}
                        onSelect={handleSelect}
                        isSelected={selectedFiles.includes(file.id)}
                    />
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <p>{selectedFiles.length} files selected</p>
                <button
                    onClick={onDone}
                    disabled={selectedFiles.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default FileList;
