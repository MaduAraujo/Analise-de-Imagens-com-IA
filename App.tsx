import React, { useState, useCallback, useMemo } from 'react';
import { identifyObjectsInImage, segmentObjectInImage } from './services/geminiService';
import SpinnerIcon from './components/icons/SpinnerIcon';
import Stepper from './components/Stepper';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-base-200 p-6 rounded-xl shadow-lg ${className}`}>
        {children}
    </div>
);

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [identifiedObjects, setIdentifiedObjects] = useState<string[]>([]);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [segmentedImageUrl, setSegmentedImageUrl] = useState<string | null>(null);

    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
    const [isLoadingSegmentation, setIsLoadingSegmentation] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const currentStep = useMemo(() => {
        if (segmentedImageUrl) {
            return 3;
        }
        if (identifiedObjects.length > 0) {
            return 2;
        }
        return 1;
    }, [identifiedObjects.length, segmentedImageUrl]);

    const handleFullReset = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setIdentifiedObjects([]);
        setSelectedObject(null);
        setSegmentedImageUrl(null);
        setError(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const resetAnalysisState = () => {
        setIdentifiedObjects([]);
        setSelectedObject(null);
        setSegmentedImageUrl(null);
        setError(null);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            resetAnalysisState();
        }
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile) {
            setError("Por favor, selecione uma imagem primeiro.");
            return;
        }
        
        resetAnalysisState();
        setIsLoadingAnalysis(true);
        
        try {
            const objects = await identifyObjectsInImage(imageFile);
            setIdentifiedObjects(objects);
            if(objects.length === 0) {
                 setError("Nenhum objeto reconhecível foi encontrado na imagem.");
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoadingAnalysis(false);
        }
    }, [imageFile]);

    const handleObjectClick = useCallback(async (objectName: string) => {
        if (!imageFile) return;

        setSelectedObject(objectName);
        setSegmentedImageUrl(null);
        setIsLoadingSegmentation(true);
        setError(null);
        
        try {
            const url = await segmentObjectInImage(imageFile, objectName);
            setSegmentedImageUrl(url);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro desconhecido na segmentação.");
        } finally {
            setIsLoadingSegmentation(false);
        }
    }, [imageFile]);
    
    const handleSaveImage = useCallback(() => {
        if (!segmentedImageUrl || !selectedObject) return;

        const link = document.createElement('a');
        link.href = segmentedImageUrl;
        
        const mimeType = segmentedImageUrl.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1] || 'png';

        link.download = `segmentado-${selectedObject.replace(/\s+/g, '_')}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [segmentedImageUrl, selectedObject]);


    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <main className="w-full max-w-6xl mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                        Análise de Imagens com IA
                    </h1>
                    <p className="text-lg text-content max-w-3xl mx-auto">
                        Carregue uma imagem para ver como a IA "enxerga" o mundo, identificando e isolando objetos.
                    </p>
                </header>

                <Stepper 
                    steps={['Carregar Imagem', 'Selecionar Objeto', 'Resultado']}
                    currentStep={currentStep}
                />

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center max-w-3xl mx-auto" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <div className="w-full max-w-3xl mx-auto">
                    {currentStep === 1 && (
                        <Card>
                            <div className="space-y-6">
                                {isLoadingAnalysis ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10 min-h-[200px]">
                                        <SpinnerIcon className="h-12 w-12 text-brand-secondary" />
                                        <p className="mt-4 text-lg">Analisando...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-secondary transition-colors w-full sm:w-auto">
                                                Selecionar Imagem
                                            </label>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                                        </div>
                                        {previewUrl ? (
                                            <div className="space-y-4">
                                                <div className="aspect-video rounded-lg overflow-hidden border-2 border-base-300">
                                                    <img src={previewUrl} alt="Pré-visualização" className="object-contain w-full h-full bg-black/20" />
                                                </div>
                                                <button
                                                    onClick={handleAnalyzeClick}
                                                    disabled={isLoadingAnalysis}
                                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Analisar Imagem
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-48 border-2 border-dashed border-base-300 rounded-lg">
                                                <p className="text-gray-400">A pré-visualização da imagem aparecerá aqui.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </Card>
                    )}

                    {currentStep === 2 && (
                        <Card>
                            <div className="space-y-6">
                                {previewUrl && (
                                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-base-300">
                                        <img src={previewUrl} alt="Imagem original" className="object-contain w-full h-full bg-black/20" />
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">Objetos Identificados</h3>
                                    <p className="text-sm">Clique em um objeto para isolá-lo da imagem.</p>
                                    <div className="flex flex-wrap gap-2">
                                        {identifiedObjects.map((obj) => (
                                            <button
                                                key={obj}
                                                onClick={() => handleObjectClick(obj)}
                                                disabled={isLoadingSegmentation}
                                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors disabled:opacity-50 ${selectedObject === obj ? 'bg-brand-secondary text-white ring-2 ring-white' : 'bg-base-300 hover:bg-brand-primary text-content'}`}
                                            >
                                                {obj}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {isLoadingSegmentation && (
                                    <div className="flex flex-col items-center justify-center text-center py-10">
                                        <SpinnerIcon className="h-12 w-12 text-brand-secondary" />
                                        <p className="mt-4 text-lg">Isolando o objeto: <span className="font-bold">{selectedObject}</span>...</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {currentStep === 3 && (
                        <Card>
                             <div className="space-y-6">
                                <h3 className="text-xl font-medium text-white">Resultado para: <span className="text-brand-secondary font-bold">{selectedObject}</span></h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div>
                                        <p className="text-center font-semibold mb-2">Original</p>
                                        <div className="aspect-video rounded-lg overflow-hidden border-2 border-base-300">
                                            <img src={previewUrl!} alt="Imagem original" className="object-contain w-full h-full bg-black/20" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-center font-semibold mb-2">Segmentado</p>
                                        <div className="aspect-video rounded-lg overflow-hidden border-2 border-base-300">
                                            <img src={segmentedImageUrl!} alt={`Objeto isolado: ${selectedObject}`} className="object-contain w-full h-full bg-black/20" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleSaveImage}
                                        className="w-full flex items-center justify-center px-6 py-3 border border-brand-secondary text-base font-medium rounded-md text-brand-secondary bg-transparent hover:bg-brand-secondary hover:text-white transition-colors"
                                    >
                                        Salvar Imagem Segmentada
                                    </button>
                                    <button
                                        onClick={handleFullReset}
                                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary transition-colors"
                                    >
                                        Analisar Outra Imagem
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;