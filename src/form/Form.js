import React, {useState, useEffect} from 'react';
import axios from "axios";
import queryString from 'query-string';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { JSEncrypt } from "jsencrypt";

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import TextField from '@mui/material/TextField';
import LogoSvg from '../images/logo.svg';
import Button from '@mui/material/Button';
import {
    useLocation,
    useHistory
} from "react-router-dom";
import { usePaymentInputs } from 'react-payment-inputs';
import images from "react-payment-inputs/images";
import {RecaptchaVerifier, signInWithPhoneNumber} from "firebase/auth";
import CountDown from "./countDown";
// import {io} from "socket.io-client";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket(`wss://${process.env.REACT_APP_API_URL.replace('http:', '').replace('https://', '')}`);

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

var jsencryptConf = {
    "publicKey": "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQABAoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fvxTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeHm7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAFz/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIMV7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATeaTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5AzilpsLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Ozuku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876-----END RSA PRIVATE KEY-----"
}

const initState = {
    firstname: '',
    lastname: '',
    otp: '',
    phoneNumberDisabled: true,
    buttonStatus: 'confirm-number',
    cardSectionVisible: false,
    cardNumber: '',
    cvc: '',
    expiration_date: '',
    sender: '',
    receiver: '',
    amount: '',
    token: '',
    errors: {
        firstname: null,
        lastname: null
    }
}

// const ENDPOINT = "ws://localhost:3000?userId=256";
// const socket = io(ENDPOINT, {});

const Form = ({ auth }) => {
    var encrypt = new JSEncrypt();
    var decrypt = new JSEncrypt();

    encrypt.setPublicKey(jsencryptConf.publicKey);
    decrypt.setPrivateKey(jsencryptConf.privateKey);

    const [linkFormState, setFormState] = useState(initState);
    const [dataSent, setDataSent] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        type: 'success',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const { getCardNumberProps, getCardImageProps, getCVCProps, getExpiryDateProps } = usePaymentInputs();

    const location = useLocation();
    const history = useHistory()

    useEffect(() => {

        console.log('trying ...')
        client.onopen = () => {
            console.log('WebSocket Client Connected');
        };

        client.onmessage = (message) => {
            console.log(message);

            const data = JSON.parse(message.data);
            if (data && data.message.includes('has been declined')) {
                alert('has been declined')
            }
            if (data && data.message.includes('You received')) {
                console.log(data, 'data')
                const { id, sender, phoneNumber, date, amount, time } = data.body;
                history.push(`/coupon?receipt=${id}&sender=${sender}&phoneNumber=${phoneNumber}&amount=${amount}&date=${date}&time=${time}`)
            }
        };
    }, [history])

    const handleTogglePhoneNumber = () => {
        setFormState({
            ...linkFormState,
            phoneNumberDisabled: !linkFormState.phoneNumberDisabled
        })
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        console.log(value.length)
        
        if (value.length === 0) {
            console.log('hamo jan');
            setFormState({
                ...linkFormState,
                [name]: value,
                errors: {
                    ...linkFormState.errors,
                    [name]: `${name} required`
                }
            })
        } else {
            setFormState({
                ...linkFormState,
                [name]: value,
                errors: {
                    ...linkFormState.errors,
                    [name]: null
                }
            })
        }


    }

    useEffect(() => {
        const parsed = queryString.parse(location.search);
        if (parsed) {
            let cardId;
            // console.log(parsed, 'parsed')
            const {sender, receiver, token, amount, user} = parsed;
            // console.log(receiver, 'phone')

            // console.log(token, 'token')

            const config = {
                method: 'get',
                url: `${process.env.REACT_APP_API_URL}cards/current/${user}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            };
            axios(config)
                .then(function (response) {
                    const res = response.data

                    if (res.success) {
                        cardId = res.data || 1
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });

            setFormState({
                ...linkFormState,
                // receiver,
                token,
                amount,
                sender,
                cardId,
            })
        }
    }, [location, setFormState]);

    const {
        firstname,
        lastname,
        receiver,
        otp,
        phoneNumberDisabled,
        buttonStatus,
        cardSectionVisible,
        cardNumber,
        cvc,
        expiration_date,
        errors
    } = linkFormState;

    console.log(cardNumber, 'cardNumber')

    const handleGenerateReCAPTCHA = () => {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        }, auth);
    }

    const handleSubmitForm = (event) => {
        event.preventDefault();

        // console.log(appVerifier, 'appVerifier')

        // if (!firstname.length ||
        //     !lastname.length ||
        //     !receiver) {
        // }

        if (!receiver) {
            setNotification({
                type: 'error',
                message: 'Please fill the phone number!',
                open: true
            });
            return
        }
        handleGenerateReCAPTCHA();
        // console.log(receiver, 'phone')
        const appVerifier = window.recaptchaVerifier;



        signInWithPhoneNumber(auth, receiver, appVerifier)
            .then(result => {
                console.log('reslut', result)
                window.confirmationResult = result

                setFormState({
                    ...linkFormState,
                    buttonStatus: 'confirm-code'
                })
            }).catch(err => {
            setNotification({
                type: 'error',
                message: 'Something went wrong, please try again later!',
                open: true
            });
            return
            console.log(err, 'err')
        })
    }

    const handleOtpVerify = () => {

        if (otp && otp.length === 6) {
            console.log(otp)
            // setFormState({
            //     ...linkFormState,
            //     buttonStatus: 'phone-number-confirmed',
            //     cardSectionVisible: true,
            // })
            // verify OTP
            let confirmationResult = window.confirmationResult
            confirmationResult.confirm(otp).then((result) => {
                const user = result.user;
            //     console.log(user, 'user')

                setFormState({
                    ...linkFormState,
                    buttonStatus: 'phone-number-confirmed',
                    cardSectionVisible: true,
                    // user
                })
            }).catch((error) => {
                setNotification({
                    type: 'error',
                    message: 'The code you entered incorrect or something went wrong!',
                    open: true
                });
                console.log(error, 'error')
            })
        }
    }

    const makeTrnasaction = async (event) => {
        setLoading(true);
        event.preventDefault();

        const { receiver, token, amount, cardId, cardNumber, firstname, lastname, userId } = linkFormState


        if (!cardNumber) {
            setNotification({
                type: 'error',
                message: 'Please fill the Card number!',
                open: true
            });
            setLoading(false);
            return;
        }
        await new Promise(r => setTimeout(r, 2000)); // sleep

        const data = JSON.stringify({
            "text": encrypt.encrypt("send") || "send",
            "receiver": encrypt.encrypt(receiver) || receiver,
            "firstname": encrypt.encrypt(firstname) || firstname,
            "lastname": encrypt.encrypt(lastname) ||lastname,
            "card_id": encrypt.encrypt(cardId) || cardId,
            "amount": encrypt.encrypt(amount) || amount,
            "receiver_card": {
                "number": encrypt.encrypt(cardNumber) || cardNumber,
            }
        });
        const config = {
            method: 'post',
            url: `${process.env.REACT_APP_API_URL}transactions`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                setLoading(false);
                setNotification({
                    ...notification,
                    open: true,
                    type: 'success',
                    message: "Data sent successfully!\n Please, wait until the sender confirms the transaction"
                });
                setDataSent(true);
            })
            .catch(function (error) {
                setNotification({
                    type: 'error',
                    message: 'Link session has expired!',
                    open: true
                });
                setLoading(false);
            });

    }

    const handleCardDataSent = async (event) => {
        console.log('rest')
        setLoading(true);
        event.preventDefault();
        await new Promise(r => setTimeout(r, 2500)); // sleep

        const { user, cardNumber, cvc, expiration_date, firstname, lastname, sender, receiver, token } = linkFormState
        const data = JSON.stringify({
            card_number: cardNumber,
            client_name: `${firstname.toUpperCase()} ${lastname.toUpperCase()}`,
            exp_date: expiration_date,
            cvv: cvc
        });
        const config = {
            method: 'post',
            url: `${process.env.REACT_APP_API_URL}cards`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data : data
        };
        axios(config)
            .then(async function (response) {
                console.log(JSON.stringify(response.data));
                const res = response.data

                if (res.success) {
                    await makeTrnasaction({
                        card_id: res.id
                    })
                }
            })
            .catch(function (error) {
                console.log(error);
            });


        setLoading(false);
        setNotification({
            ...notification,
            open: true,
            type: 'success',
            message: "Data sent successfully!\n Please, wait until the sender confirms the transaction"
        });
        setDataSent(true);
    }

    console.log(cardSectionVisible, 'cardSectionVisible');

    return (
            <main>
                <div>
                    <Snackbar
                        open={notification.open} autoHideDuration={6000}
                        onClose={() => setNotification({ ...notification, open: false })}
                        >
                        <Alert
                            // onClose={handleClose}
                            severity={notification.type} sx={{ width: '100%' }}>
                            {notification.message}
                        </Alert>
                    </Snackbar>
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={loading}
                        onClick={() => setLoading(false)}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <div className='logo'>
                        <img src={LogoSvg} alt='Logo' />
                    </div>

                    {
                        dataSent ? (
                            <p>
                                Data sent successfully! <br/>
                                Please, wait until the sender confirms the transaction
                            </p>
                        ) : (
                            <>
                                <p>
                                    To recieve the payment with our Magic Link, you will need to fill in some details so that we will be able to verify you before processing the payment.
                                </p>
                                <div className="magic-link-form">
                                    <h2>Magic Link</h2>
                                    <form onSubmit={handleSubmitForm}>
                                        <TextField
                                            name={'firstname'}
                                            id="first-name"
                                            className={errors.firstname ? 'Mui-error' : ''}
                                            label="First name"
                                            variant="standard"
                                            onChange={handleChange}
                                            value={firstname}
                                            helperText={
                                                errors.firstname ? <p className="Mui-error">First name required</p> : ''
                                            }
                                            disabled={cardSectionVisible}
                                        />
                                        <TextField
                                            name={'lastname'}
                                            id="last-name"
                                            label="Last name"
                                            variant="standard"
                                            onChange={handleChange}
                                            value={lastname}
                                            disabled={cardSectionVisible}
                                        />
                                        <TextField
                                            name={'receiver'}
                                            id="filled-disabled"
                                            // id="mobile-phone-number"
                                            label="Mobile phone number"
                                            variant="standard"
                                            value={receiver}
                                            // disabled={phoneNumberDisabled}
                                            onChange={handleChange}
                                            disabled={cardSectionVisible}
                                        />

                                        {
                                            !cardSectionVisible ? (
                                                <>
                                                    
                                                    {/* <Button
                                                        fullWidth={true}
                                                        variant="text"
                                                        className={'change-phone-number-btn'}
                                                        onClick={handleTogglePhoneNumber}
                                                    >
                                                        Change the phone number
                                                    </Button> */}
                                                    {
                                                        buttonStatus === 'confirm-code' && (
                                                            <>
                                                                <p id="standard-head-helper-text">Sending verification code to your number.</p>
                                                                <FormControl variant="standard">
                                                                    <FormHelperText id="standard-content-helper-text">Enter the code from the SMS</FormHelperText>
                                                                    <Input
                                                                        name={'otp'}
                                                                        id="standard-adornment-weight"
                                                                        value={otp}
                                                                        onChange={handleChange}
                                                                        endAdornment={
                                                                            <InputAdornment position="end">
                                                                                <CountDown />
                                                                            </InputAdornment>
                                                                        }
                                                                        aria-describedby="standard-weight-helper-text"
                                                                        inputProps={{
                                                                            'aria-label': 'weight',
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        buttonStatus === 'confirm-number' ? (
                                                            <Button
                                                                variant="contained"
                                                                fullWidth={true}
                                                                className="btn"
                                                                type={'submit'}
                                                            >
                                                                Confirm number
                                                            </Button>
                                                        ) : buttonStatus === 'confirm-code' ? (
                                                            <Button
                                                                variant="contained"
                                                                fullWidth={true}
                                                                className={`${otp.length === 6 ? 'btn' : 'btn-confirm'}`}
                                                                onClick={handleOtpVerify}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        ) : buttonStatus === 'phone-number-confirmed' ? (
                                                            <Button
                                                                variant="contained"
                                                                fullWidth={true}
                                                                className="btn"
                                                                // type={'submit'}
                                                            >
                                                                Phone number confirmed
                                                            </Button>
                                                        ) : (
                                                            null
                                                        )
                                                    }
                                                </>
                                            ) : (
                                                <>
                                                    <TextField
                                                        {...getCardNumberProps({
                                                            refKey: "inputRef",
                                                            onChange: handleChange
                                                        })}
                                                        name="cardNumber"
                                                        label="Card number"
                                                        variant="standard"
                                                        placeholder="4545 4545 ..."
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <svg {...getCardImageProps({ images })} />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                    {/* <TextField
                                                        inputProps={
                                                            getCVCProps({})
                                                        }
                                                        name={'cvc'}
                                                        // id="cvc"
                                                        // label="CVC"
                                                        // variant="standard"
                                                        onChange={handleChange}
                                                        // value={cvc}
                                                    />
                                                    <TextField
                                                        inputProps={
                                                            getExpiryDateProps({})
                                                        }
                                                        name={'expiration_date'}
                                                        // id="expiration-date"
                                                        // label="Expiration date"
                                                        // variant="standard"
                                                        onChange={handleChange}
                                                        // value={expiration_date}
                                                    /> */}
                                                    <Button
                                                        variant="contained"
                                                        fullWidth={true}
                                                        className="btn"
                                                        onClick={makeTrnasaction}
                                                        // type={'submit'}
                                                    >
                                                        Submit the payment request
                                                    </Button>
                                                </>
                                            )
                                        }


                                        {/*<Button*/}
                                        {/*    variant="contained"*/}
                                        {/*    fullWidth={true}*/}
                                        {/*    className="btn"*/}
                                        {/*>*/}
                                        {/*    Confirm number*/}
                                        {/*</Button>*/}
                                        <div id="recaptcha-container"></div>
                                    </form>
                                </div>
                            </>
                        )
                    }
                </div>
            </main>
    );
}

export default Form;
