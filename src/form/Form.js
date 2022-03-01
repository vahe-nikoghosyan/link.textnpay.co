import React, {useState, useEffect} from 'react';
import axios from "axios";
import queryString from 'query-string';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

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
    token: ''
}

// const ENDPOINT = "ws://localhost:3000?userId=256";
// const socket = io(ENDPOINT, {});

const Form = ({ auth }) => {
    const [linkFormState, setFormState] = useState(initState);
    const [dataSent, setDataSent] = useState(false);
    const [notification, setNotification] = useState(false);
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

        console.log(name, value)
        setFormState({
            ...linkFormState,
            [name]: value
        })
    }

    useEffect(() => {
        const parsed = queryString.parse(location.search);
        if (parsed) {
            console.log(parsed, 'parsed')
            const {sender, receiver, token, amount} = parsed;
            console.log(receiver, 'phone')
            setFormState({
                ...linkFormState,
                receiver,
                token,
                amount,
                sender
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
        expiration_date
    } = linkFormState;

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
        handleGenerateReCAPTCHA();
        console.log(receiver, 'phone')
        const appVerifier = window.recaptchaVerifier;
        console.log(appVerifier, 'appVerifier')


        signInWithPhoneNumber(auth, receiver, appVerifier)
            .then(result => {
                console.log('reslut', result)
                window.confirmationResult = result

                setFormState({
                    ...linkFormState,
                    buttonStatus: 'confirm-code'
                })
            }).catch(err => {
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
                console.log(user, 'user')

                setFormState({
                    ...linkFormState,
                    buttonStatus: 'phone-number-confirmed',
                    cardSectionVisible: true,
                    user
                })
            }).catch((error) => {
                console.log(error, 'error')
            })
        }
    }

    const makeTrnasaction = async (reqData) => {
        const { receiver, token, amount } = linkFormState
        const data = JSON.stringify({
            "text":"send",
            "receiver": receiver,
            "card_id": reqData.card_id,
            "amount": amount,
            "receiver_card":{
                "number":"4242424242424242",
                "exp":"10/24",
                "cvc":"867"}
        });
        const config = {
            method: 'post',
            url: `${process.env.REACT_APP_API_URL}transactions`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data : data
        };
        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
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
        setNotification(true);
        setDataSent(true);
    }

    return (
            <main>
                <div>
                    <Snackbar
                        open={notification} autoHideDuration={6000}
                        onClose={() => setNotification(false)}
                        >
                        <Alert
                            // onClose={handleClose}
                            severity="success" sx={{ width: '100%' }}>
                            Data sent successfully!
                            Please, wait until the sender confirms the transaction
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
                                            label="First name"
                                            variant="standard"
                                            onChange={handleChange}
                                            value={firstname}
                                        />
                                        <TextField
                                            name={'lastname'}
                                            id="last-name"
                                            label="Last name"
                                            variant="standard"
                                            onChange={handleChange}
                                            value={lastname}
                                        />

                                        {
                                            !cardSectionVisible ? (
                                                <>
                                                    <TextField
                                                        name={'receiver'}
                                                        id="filled-disabled"
                                                        // id="mobile-phone-number"
                                                        label="Mobile phone number"
                                                        variant="standard"
                                                        value={receiver}
                                                        disabled={phoneNumberDisabled}
                                                        onChange={handleChange}
                                                    />
                                                    <Button
                                                        fullWidth={true}
                                                        variant="text"
                                                        className={'change-phone-number-btn'}
                                                        onClick={handleTogglePhoneNumber}
                                                    >
                                                        Change the phone number
                                                    </Button>
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
                                                        inputProps={
                                                            getCardNumberProps({})
                                                        }
                                                        InputProps={{
                                                            ...getCardNumberProps({endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <svg {...getCardImageProps({ images })} />
                                                                    </InputAdornment>
                                                                )}),
                                                            onChange: handleChange
                                                        }}
                                                        name={'cardNumber'}
                                                        // id="card-number"
                                                        // label="Card number"
                                                        // variant="standard"
                                                        onChange={handleChange}
                                                        // value={card_number}
                                                    />
                                                    <TextField
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
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        fullWidth={true}
                                                        className="btn"
                                                        onClick={handleCardDataSent}
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
