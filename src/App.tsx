import { useEffect, useRef, useState } from 'react';
import './App.css'
import redEye from '../public/redEye.png';
import fire from '../public/fire.gif';

function App() {

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [showEyes, setShowEyes] = useState(false);
  const [fetchAddress, setFetchAddress] = useState<string>('');

  useEffect(() => {
    if(process.env.NODE_ENV === 'development') {
      setFetchAddress('http://localhost:8080/whisper');
    } else {
      setFetchAddress('https://oyster-app-yues3.ondigitalocean.app/whisper');
    }
  }, []);

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
      const response = await fetch(fetchAddress, {
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
      setShowEyes(true);
      audio.onended = () => {
        setShowEyes(false);
      }
      
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
    }

  }

  return (
    <>
      <div className='topFireDiv'>
        <img src={fire} alt="fire" className={`eyeImage ${showEyes ? 'show' : ''}`} id='leftFire'/>
        <img src={fire} alt="fire" className={`eyeImage ${showEyes ? 'show' : ''}`} id='rightFire'/>
      </div>
      <div className='eyesDiv'>
        <img src={redEye} alt="eyes" className={`eyeImage ${showEyes ? 'show' : ''}`} />
        <img src={redEye} alt="eyes" className={`eyeImage ${showEyes ? 'show' : ''}`} /> 
      </div>
      <h1>Introduce yourself...</h1>
      {isRecording ? (
                <button onClick={stopRecording} className='stopTalking'>Stop Talking</button>
            ) : (
                <button onClick={startRecording}>Start Talking</button>
            )}
      <div className='bottomFireDiv'>
        <img src={fire} alt="fire" className={`eyeImage ${showEyes ? 'show' : ''}`} id='bottomFire'/>
      </div>
      <footer className='footer'><a href="https://www.flaticon.com/free-icons/red-eyes" title="red eyes icons">Red eyes icons created by Muhammad_Usman - Flaticon</a></footer>
    </>
  )
}

export default App
