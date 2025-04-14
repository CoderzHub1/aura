import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from './components/Navbar';
import styles from '../styles/profile.module.css';

const Profile = () => {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newContact, setNewContact] = useState({
        name: '',
        relationship: '',
        phone: ''
    });
    const [newEmailContact, setNewEmailContact] = useState({
        name: '',
        relationship: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            router.push('/get-started');
            return;
        }
        setUserEmail(email);
        fetchUserData(email);
    }, []);

    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`/api/profile?email=${email}`);
            const data = await response.json();
            if (response.ok) {
                setUserData(data);
            } else {
                setError('Failed to fetch user data');
            }
        } catch (err) {
            setError('Error loading user data');
        } finally {
            setLoading(false);
        }
    };

    const handleContactChange = (e) => {
        setNewContact({
            ...newContact,
            [e.target.name]: e.target.value
        });
    };

    const handleEmailContactChange = (e) => {
        setNewEmailContact({
            ...newEmailContact,
            [e.target.name]: e.target.value
        });
    };

    const addEmergencyContact = async (e) => {
        e.preventDefault();
        if (!newContact.name || !newContact.relationship || !newContact.phone) {
            setError('Please fill all fields');
            return;
        }

        if (userData.emergencyContacts.length >= 5) {
            setError('Maximum 5 emergency contacts allowed');
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    updates: {
                        emergencyContacts: [...userData.emergencyContacts, newContact]
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setUserData(data);
                setNewContact({ name: '', relationship: '', phone: '' });
                setSuccess('Emergency contact added successfully');
                setError('');
            } else {
                setError('Failed to add emergency contact');
            }
        } catch (err) {
            setError('Error adding emergency contact');
        }
    };

    const addEmergencyEmail = async (e) => {
        e.preventDefault();
        if (!newEmailContact.name || !newEmailContact.relationship || !newEmailContact.email) {
            setError('Please fill all email contact fields');
            return;
        }

        if (userData.emergencyEmails && userData.emergencyEmails.length >= 5) {
            setError('Maximum 5 emergency email contacts allowed');
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    updates: {
                        emergencyEmails: [...(userData.emergencyEmails || []), newEmailContact]
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setUserData(data);
                setNewEmailContact({ name: '', relationship: '', email: '' });
                setSuccess('Emergency email contact added successfully');
                setError('');
            } else {
                setError('Failed to add emergency email contact');
            }
        } catch (err) {
            setError('Error adding emergency email contact');
        }
    };

    const removeContact = async (index) => {
        try {
            const updatedContacts = userData.emergencyContacts.filter((_, i) => i !== index);
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    updates: {
                        emergencyContacts: updatedContacts
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setUserData(data);
                setSuccess('Emergency contact removed successfully');
                setError('');
            } else {
                setError('Failed to remove emergency contact');
            }
        } catch (err) {
            setError('Error removing emergency contact');
        }
    };

    const removeEmailContact = async (index) => {
        try {
            const updatedEmails = userData.emergencyEmails.filter((_, i) => i !== index);
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    updates: {
                        emergencyEmails: updatedEmails
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setUserData(data);
                setSuccess('Emergency email contact removed successfully');
                setError('');
            } else {
                setError('Failed to remove emergency email contact');
            }
        } catch (err) {
            setError('Error removing emergency email contact');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <Navbar />
            <div className={styles.container}>
                <h1 className={styles.title}>Profile</h1>
                
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <div className={styles.userInfo}>
                    <h2>User Information</h2>
                    <p><strong>Name:</strong> {userData?.name || 'Not set'}</p>
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Member since:</strong> {new Date(userData?.createdAt).toLocaleDateString()}</p>
                </div>

                <div className={styles.emergencyContacts}>
                    <h2>Emergency Contacts (SMS) ({userData?.emergencyContacts?.length || 0}/5)</h2>
                    
                    <div className={styles.contactsList}>
                        {userData?.emergencyContacts?.map((contact, index) => (
                            <div key={index} className={styles.contactCard}>
                                <p><strong>Name:</strong> {contact.name}</p>
                                <p><strong>Relationship:</strong> {contact.relationship}</p>
                                <p><strong>Phone:</strong> {contact.phone}</p>
                                <button 
                                    onClick={() => removeContact(index)}
                                    className={styles.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {userData?.emergencyContacts?.length < 5 && (
                        <form onSubmit={addEmergencyContact} className={styles.addContactForm}>
                            <h3>Add Emergency Contact (SMS)</h3>
                            <input
                                type="text"
                                name="name"
                                placeholder="Contact Name"
                                value={newContact.name}
                                onChange={handleContactChange}
                            />
                            <input
                                type="text"
                                name="relationship"
                                placeholder="Relationship"
                                value={newContact.relationship}
                                onChange={handleContactChange}
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={newContact.phone}
                                onChange={handleContactChange}
                            />
                            <button type="submit">Add Contact</button>
                        </form>
                    )}
                </div>

                <div className={styles.emergencyEmails}>
                    <h2>Emergency Contacts (Email) ({userData?.emergencyEmails?.length || 0}/5)</h2>
                    
                    <div className={styles.contactsList}>
                        {userData?.emergencyEmails?.map((contact, index) => (
                            <div key={index} className={styles.contactCard}>
                                <p><strong>Name:</strong> {contact.name}</p>
                                <p><strong>Relationship:</strong> {contact.relationship}</p>
                                <p><strong>Email:</strong> {contact.email}</p>
                                <button 
                                    onClick={() => removeEmailContact(index)}
                                    className={styles.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {(!userData?.emergencyEmails || userData.emergencyEmails.length < 5) && (
                        <form onSubmit={addEmergencyEmail} className={styles.addContactForm}>
                            <h3>Add Emergency Contact (Email)</h3>
                            <input
                                type="text"
                                name="name"
                                placeholder="Contact Name"
                                value={newEmailContact.name}
                                onChange={handleEmailContactChange}
                            />
                            <input
                                type="text"
                                name="relationship"
                                placeholder="Relationship"
                                value={newEmailContact.relationship}
                                onChange={handleEmailContactChange}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={newEmailContact.email}
                                onChange={handleEmailContactChange}
                            />
                            <button type="submit">Add Email Contact</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile; 