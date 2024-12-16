import React, { useState, useRef, useEffect } from 'react';
import Keyboard from './Keyboard';
import '../css/login.css';
import { useNavigate } from 'react-router-dom';

import woktossImage from "../resources/images/woktoss.gif";

// const Login = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [isShift, setIsShift] = useState(false);
//     const [focusedField, setFocusedField] = useState(null);

//     const usernameRef = useRef(null);
//     const passwordRef = useRef(null);

//     const handleLogin = async () => {
//         try {
//             const response = await fetch('/api/auth/login', 
//             { 
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ username, password }),
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 console.log(data);
//                 if (data.role === 'manager') {
//                     console.log("MANAGER");
//                     window.location.href = '/';
//                 } else if (data.role === 'employee') {
//                     console.log("EMPLOYEE");
//                     window.location.href = 'employee/checkout';
//                 } else {
//                     setError('Unexpected user role.');
//                 }
//             } else {
//                 const data = await response.json();
//                 setError(data.message || 'Invalid username or password.');
//                 setUsername('');
//                 setPassword('');
//             }
//         } catch (err) {
//             console.error('Login error:', err);
//             setError('An error occurred. Please try again.');
//         }
//     };

//     const handleKeyPress = (key) => {
//         if (focusedField === 'username') {
//             if (key === 'Backspace') {
//                 setUsername(username.slice(0, -1));
//             } else if (key === 'Enter') {
//                 handleLogin();
//             } else if (key === 'Shift') {
//                 setIsShift(!isShift);
//             } else {
//                 const char = isShift ? key.toUpperCase() : key.toLowerCase();
//                 setUsername(username + char);
//             }
//         } else if (focusedField === 'password') {
//             if (key === 'Backspace') {
//                 setPassword(password.slice(0, -1));
//             } else if (key === 'Enter') {
//                 handleLogin();
//             } else if (key === 'Shift') {
//                 setIsShift(!isShift);
//             } else {
//                 const char = isShift ? key.toUpperCase() : key.toLowerCase();
//                 setPassword(password + char);
//             }
//         }
//     };

//     return (
//         <div className="stack-pane">
//             <div className="login-container">
//                 <h2 className="login-label">Log in</h2>
//                 <div className="input-container">
//                     <input
//                         type="text"
//                         ref={usernameRef}
//                         className="input-field"
//                         placeholder="Username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         onClick={() => setFocusedField('username')}
//                     />
//                     <input
//                         type="password"
//                         ref={passwordRef}
//                         className="input-field"
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         onClick={() => setFocusedField('password')}
//                     />
//                     {error && <div className="error-label">{error}</div>}
//                 </div>
//                 <Keyboard onKeyPress={handleKeyPress} />
//             </div>
//         </div>
//     );
// };

function Login() {
    useEffect(() => {
        async function fetchData() {
            try {
                //get data from endpoint, map it to table in html code
                const response = await fetch(process.env.REACT_APP_PROXY+'/api/auth/login');
                if (response.ok) {
                    const data = await response.json();
                    window.location.href = data;
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <section className="d-flex flex-column justify-content-center align-items-center vw-100 vh-100 gap-4 px-0">
            <div class="bg-panda-red spinner-grow" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </section>
    );
}

export default Login;
