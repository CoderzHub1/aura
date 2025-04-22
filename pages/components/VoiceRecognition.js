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
  const [chatHistory, setChatHistory] = useState([]);
  const recognitionRef = useRef(null);
  const genAIRef = useRef(null);
  const chatRef = useRef(null);
  const def = "Say 'Hey' to start..."

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
  const speak = useCallback((text) => {
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
  }, []);

  // Initialize Gemini
  const initializeGemini = useCallback(async () => {
    try {
      // Initialize the API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      genAIRef.current = genAI;
      
      // Create initial history with system prompt
      const initialHistory = [
        {
          role: "user",
          parts: [{ text: "You are Aura, a voice assistant. When responding, format your answers in a natural, conversational way as if you're speaking without emojis. Avoid using special characters, mathematical notation, or markdown. Use plain text that would sound natural when read aloud. For example, instead of '$\\boxed{2}$' just say '2'. Keep responses concise and friendly." }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll speak naturally and conversationally, avoiding special formatting and keeping my responses clear and easy to read aloud." }],
        }
      ];
      
      // Create a chat session
      const chat = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }).startChat({
        history: initialHistory
      });
      
      chatRef.current = chat;
      return chat;
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      setError('Failed to initialize Gemini chat');
      return null;
    }
  }, []);

  // Send message to Gemini
  const sendMessageToGemini = useCallback(async (prompt) => {
    try {
      // Initialize chat if not already done
      if (!chatRef.current) {
        await initializeGemini();
      }
      
      // Add the message to chat history UI
      const updatedHistory = [...chatHistory, { role: 'user', text: prompt }];
      setChatHistory(updatedHistory);

      // Send message to Gemini
      const result = await chatRef.current.sendMessage([{ text: prompt }]);
      const responseText = result.response.text();
      
      // Update chat history UI with the response
      setChatHistory([...updatedHistory, { role: 'assistant', text: responseText }]);
      
      setResponse(responseText);
      speak(responseText); // Speak the response
      return responseText;
    } catch (error) {
      console.error('Error with Gemini:', error);
      setError('Failed to get response from Gemini');
      return null;
    }
  }, [chatHistory, initializeGemini, speak]);

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

  // Process speech recognition results
  const processSpeechResults = useCallback((event) => {
    // If currently speaking, ignore speech input
    if (isSpeaking) return;

    let interimTranscript = '';
    let currentTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        if (isPromptMode) {
          // In prompt mode, send the final transcript to Gemini
          sendMessageToGemini(transcript);
          setIsPromptMode(false); // Exit prompt mode after sending
          return; // Clear the transcript for the next input
        } else {
          // Check for wake word "Hey"
          if (transcript.toLowerCase().includes('hey')) {
            setIsPromptMode(true); // Enter prompt mode
            return; // Clear the transcript for the next input
          } else {
            currentTranscript += transcript + ' ';
          }
        }
      } else {
        interimTranscript = transcript;
      }
    }

    setTranscript(currentTranscript + interimTranscript);
  }, [isSpeaking, isPromptMode, sendMessageToGemini]);

  useEffect(() => {
    // Initialize Gemini chat on component mount
    initializeGemini();
    
    const recognition = initializeSpeechRecognition();
    if (!recognition) return;

    // Set up the callbacks
    recognition.onresult = processSpeechResults;

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
  }, [
    isListening, 
    isSpeaking, 
    initializeSpeechRecognition, 
    startRecognition, 
    stopRecognition, 
    initializeGemini, 
    processSpeechResults
  ]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (isListening) {
      setIsPromptMode(false);
    }
    setError('');
  };

  const resetChat = async () => {
    // Reset chat history
    setChatHistory([]);
    setResponse('');
    
    // Reinitialize the chat
    await initializeGemini();
  };

  return (
    <div className={styles.voiceContainer}>
      <div className={styles.buttonGroup}>
        <button 
          onClick={toggleListening}
          className={`${styles.listenButton} ${isListening ? styles.listening : ''}`}
        >
          {isListening ? 'Pause Listening' : 'Resume Listening'}
        </button>

        <button 
          onClick={resetChat}
          className={styles.resetButton}
        >
          New Conversation
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.status}>
        {isPromptMode && <div className={styles.promptMode}>Listening for prompt...</div>}
        {!isPromptMode && isListening && <div className={styles.waitingMode}>Waiting for &quot;Hey&quot;...</div>}
        {!isListening && <div className={styles.pausedMode}>Listening paused</div>}
        {isSpeaking && <div className={styles.speaking}>Speaking response...</div>}
      </div>

      <div className={styles.transcriptContainer}>
        <h3>Transcript:</h3>
        <p>{transcript || def}</p>
      </div>

      <div className={styles.chatContainer}>
        <h3>Conversation:</h3>
        {chatHistory.length > 0 ? (
          <div className={styles.chatHistory}>
            {chatHistory.map((message, index) => (
              <div key={index} className={`${styles.chatMessage} ${styles[message.role]}`}>
                <strong>{message.role === 'user' ? 'You' : 'Aura'}:</strong> {message.text}
              </div>
            ))}
          </div>
        ) : (
          <p>No conversation yet. Say &quot;Hey&quot; to start talking with Aura.</p>
        )}
      </div>

      {response && (
        <div className={styles.responseContainer}>
          <h3>Latest Response:</h3>
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