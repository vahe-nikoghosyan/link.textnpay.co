import {useState, useEffect} from "react";
import {useLocation} from "react-router-dom";
import FooterLogo from './coupon-footer-logo.svg'
import './coupon.scss';
import queryString from "query-string";

const initState = {
    receipt: '',
    sender: '',
    phoneNumber: '',
    amount: '',
    date: '',
    time: '',
}

const Coupon = () => {
    const [couponState, setCouponState] = useState(initState);
    const location = useLocation();

    useEffect(() => {
        const parsed = queryString.parse(location.search);
        if (parsed) {
            const { receipt,sender, phoneNumber, amount, date, time } = parsed;
            setCouponState({
                ...couponState,
                receipt,
                sender,
                phoneNumber,
                amount,
                date,
                time
            })
        }
    }, [location, setCouponState]);
    console.log(couponState, 'coupon state')
    const { receipt,sender, phoneNumber, amount, date, time} = couponState;

    return (
        <div className={'Coupon-container'}>
            <div className={'Coupon'}>
                <div className={'Coupon-head'}>
                    <span>Payment Receipt</span>
                    <span>{receipt}</span>
                </div>
                <div className={'Coupon-content'}>
                    <div>
                        <span>Sender:</span>
                        <span>{sender}</span>
                    </div>
                    <div>
                        <span>Phone number:</span>
                        <span>{phoneNumber}</span>
                    </div>
                    <div>
                        <span>Amount:</span>
                        <span>{amount} AMD</span>
                    </div>
                    <div>
                        <span>Date:</span>
                        <span>{date}</span>
                    </div>
                    <div>
                        <span>Time:</span>
                        <span>{time}</span>
                    </div>
                </div>
                <div className={'Coupon-footer'}>
                    <img src={FooterLogo} alt={'FooterLogo'}/>
                </div>
            </div>
        </div>
    )
}

export default Coupon
