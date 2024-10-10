import { useRef, useState } from 'react';
import './App.css'

function App() {

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    const audioChunks: BlobPart[] = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);

      sendAudio(byteArray);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendAudio = async (byteArray: Uint8Array) => {

    try {
      console.log('Sending audio to server...', byteArray.length);
      const response = await fetch('http://localhost:8080/whisper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: byteArray,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const audioResponse = response.blob();
      const audioUrl = URL.createObjectURL(await audioResponse);
      const audio = new Audio(audioUrl);
      audio.play();
      
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
    }

  }

  return (
    <>
      <h1>Talk if you dare...</h1>
      {isRecording ? (
                <button onClick={stopRecording}>Stop Recording</button>
            ) : (
                <button onClick={startRecording}>Start Recording</button>
            )}
    </>
  )
}

export default App
