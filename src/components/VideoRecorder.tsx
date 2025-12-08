import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface VideoRecorderRef {
    startRecording: () => void;
    stopRecording: () => void;
    getBlob: () => Blob | null;
}

const VideoRecorder = forwardRef<VideoRecorderRef>((_, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Could not access camera/microphone. Please allow permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useImperativeHandle(ref, () => ({
        startRecording: () => {
            if (stream && MediaRecorder.isTypeSupported('video/webm')) {
                chunksRef.current = [];
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
            } else {
                setError('Video recording not supported or camera not active');
            }
        },
        stopRecording: () => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
        },
        getBlob: () => {
            if (chunksRef.current.length === 0) return null;
            return new Blob(chunksRef.current, { type: 'video/webm' });
        }
    }));

    return (
        <div className="video-recorder" style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto 1rem',
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#000'
        }}>
            {error ? (
                <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
                    {error}
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', display: 'block' }}
                    />
                    {isRecording && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'red',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            animation: 'pulse 1.5s infinite'
                        }}>
                            REC
                        </div>
                    )}
                </>
            )}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
});

export default VideoRecorder;
