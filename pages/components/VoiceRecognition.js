'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import styles from '../../styles/VoiceRecognition.module.css';

export default function VoiceRecognition() {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return null;
    }

    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    }

    return recognitionRef.current;
  }, []);

  // Initialize speech synthesis
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Stop listening while speaking
      setIsListening(false);
      setIsSpeaking(true);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        // Resume listening after speaking
        setIsListening(true);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsListening(true);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setError('Text-to-speech is not supported in this browser.');
    }
  };

  // Initialize Gemini
  const initializeGemini = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create a chat session with system prompt
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{
              text: "You are Aura, a voice assistant. When responding, format your answers in a natural, conversational way as if you're speaking without emojis. Avoid using special characters, mathematical notation, or markdown. Use plain text that would sound natural when read aloud. For example, instead of '$\\boxed{2}$' just say '2'. Keep responses concise and friendly."
            }]
          },
          {
            role: "model",
            parts: [{
              text: "I understand. I'll speak naturally and conversationally, avoiding special formatting and keeping my responses clear and easy to read aloud."
            }]
          }
        ]
      });

      // Send the user's prompt and get response
      const result = await chat.sendMessage([{ text: prompt }]);
      const response = await result.response;
      const responseText = response.text();
      setResponse(responseText);
      speak(responseText); // Speak the response
      return responseText;
    } catch (error) {
      console.error('Error with Gemini:', error);
      setError('Failed to get response from Gemini');
      return null;
    }
  };

  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.start();
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        // Recognition is already started, ignore the error
        console.log('Recognition already started');
      } else {
        console.error('Error starting recognition:', error);
        setError('Failed to start speech recognition');
        setIsListening(false);
      }
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  useEffect(() => {
    const recognition = initializeSpeechRecognition();
    if (!recognition) return;

    let currentTranscript = '';

    recognition.onresult = (event) => {
      // If currently speaking, ignore speech input
      if (isSpeaking) return;

      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          if (isPromptMode) {
            // In prompt mode, send the final transcript to Gemini
            initializeGemini(transcript).then(response => {
              if (response) {
                setResponse(response);
              }
            });
            setIsPromptMode(false); // Exit prompt mode after sending
            currentTranscript = ''; // Clear the transcript for the next input
          } else {
            // Check for wake word "Hey"
            if (transcript.toLowerCase().includes('hey')) {
              setIsPromptMode(true); // Enter prompt mode
              currentTranscript = ''; // Clear the transcript for the next input
            } else {
              currentTranscript += transcript + ' ';
            }
          }
        } else {
          interimTranscript = transcript;
        }
      }

      setTranscript(currentTranscript + interimTranscript);
    };

    recognition.onend = () => {
      // Only restart recognition if we're supposed to be listening and not speaking
      if (isListening && !isSpeaking) {
        // Add a small delay before restarting
        setTimeout(() => {
          if (isListening && !isSpeaking) {
            startRecognition();
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'aborted') {
        // Ignore aborted errors as they're usually from intentional stops
        return;
      }
      
      setError(`Speech recognition error: ${event.error}`);
      if (event.error === 'network' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    if (isListening) {
      startRecognition();
    }

    return () => {
      stopRecognition();
    };
  }, [isListening, isPromptMode, initializeSpeechRecognition, startRecognition, stopRecognition]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (isListening) {
      setIsPromptMode(false);
    }
    setError('');
  };

  return (
    <div className={styles.voiceContainer}>
      <button 
        onClick={toggleListening}
        className={`${styles.listenButton} ${isListening ? styles.listening : ''}`}
      >
        {isListening ? 'Pause Listening' : 'Resume Listening'}
      </button>

      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.status}>
        {isPromptMode && <div className={styles.promptMode}>Listening for prompt...</div>}
        {!isPromptMode && isListening && <div className={styles.waitingMode}>Waiting for "Hey"...</div>}
        {!isListening && <div className={styles.pausedMode}>Listening paused</div>}
        {isSpeaking && <div className={styles.speaking}>Speaking response...</div>}
      </div>

      <div className={styles.transcriptContainer}>
        <h3>Transcript:</h3>
        <p>{transcript || 'Say "Hey" to start...'}</p>
      </div>

      {response && (
        <div className={styles.responseContainer}>
          <h3>Gemini Response:</h3>
          <p>{response}</p>
          <button 
            onClick={() => speak(response)} 
            className={styles.speakButton}
            disabled={isSpeaking}
          >
            {isSpeaking ? 'Speaking...' : 'Speak Response'}
          </button>
        </div>
      )}
    </div>
  );
} 