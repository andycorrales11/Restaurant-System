import React, { useState, useEffect } from 'react';
import "../css/kitchen-screen.css";
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Timer Component
const Timer = ({ startTime }) => {
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return <span>{formatTime(timeElapsed)}</span>;
};

// Order Component
const Order = ({ order, onComplete }) => {
    const { orderNumber, items, startTime } = order;
    let orderStatus = "Preparing";

    // Calculate the elapsed time in seconds
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    let orderStyle = {};

    // Apply colors based on elapsed time
    if (elapsedTime > 600) {
        orderStyle = { backgroundColor: '#ff6666' }; // Red for > 10 minutes
        orderStatus = "Overdue";
    } else if (elapsedTime > 300) {
        orderStyle = { backgroundColor: '#ffcc66' }; // Orange for > 5 minutes
    }

    return (
        <div
            className="order-cell"
            style={orderStyle}
            onClick={() => onComplete(orderNumber)} // Mark order as completed on click
        >
            <div className="order-details">
                <h4>Order #{orderNumber}</h4>
                <div className="order-items">
                    {items.map((item, index) => (
                        <div key={index}>
                            {item.name} x{item.quantity}
                        </div>
                    ))}
                </div>
                <div className="order-time">
                    <span>Time Elapsed: <Timer startTime={startTime} /></span>
                </div>
                <div className="order-status">{orderStatus}</div>
            </div>
        </div>
    );
};

// Kitchen Screen Component
const KitchenScreen = () => {
    const [orders, setOrders] = useState([]);

    const transformOrders = (data) => {
        const ordersMap = new Map();
        data.forEach(item => {
            const { orderid, date, meal, item_type, side, entree1, entree2, entree3 } = item;
            if (!ordersMap.has(orderid)) {
                ordersMap.set(orderid, {
                    orderNumber: orderid,
                    items: [],
                    startTime: new Date(date).getTime()
                });
            }

            const order = ordersMap.get(orderid);

            if (meal) {
                if (side !== "None") {
                    const existingSide = order.items.find(item => item.name === side);
                    if (existingSide) {
                        existingSide.quantity++;
                    }
                    else {
                        order.items.push({ name: side, quantity: 1});
                    }
                }

                [entree1, entree2, entree3].forEach(entree => {
                    if (entree !== "None") {
                        const existingEntree = order.items.find(item => item.name === entree);
                        if (existingEntree) {
                            existingEntree.quantity++;
                        }
                        else {
                            order.items.push({ name: entree, quantity: 1 });
                        }
                    }
                });
            }
            else {
                const existingItem = order.items.find(item => item.name === item_type);
                if (existingItem) {
                    existingItem.quantity++;
                }
                else {
                    order.items.push({ name: item_type, quantity: 1 });
                }
            }
        });
        return Array.from(ordersMap.values());
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/kitchenscreen/orders');
            const data = await response.json();
            const transformedData = transformOrders(data);
            setOrders(transformedData);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
        }
    }

    async function finishOrderInDatabase(item) {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/kitchenscreen/finishorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item),
            });
        }
        catch (error) {
            console.error('Error: ', error);
        }
    }

    // Force re-render every second
    useEffect(() => {
        fetchOrders();

        const interval = setInterval(() => {
            setOrders((prevOrders) => [...prevOrders]); // Trigger re-render
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Function to mark an order as completed and remove it
    const completeOrder = (orderNumber) => {
        const order = [];
        const orderObject = {
            orderNumber: orderNumber
        };
        order.push(orderObject);
        finishOrderInDatabase(order);
        setOrders((prevOrders) =>
            prevOrders.filter((order) => order.orderNumber !== orderNumber)
        );
    };

    return (
        <div className="kitchen-screen-container">
            <Link to='/home' className="d-flex flex-row align-items-center align-self-start gap-2 text-black link-no-underline" >
                <ArrowBackIcon sx={{ fontSize: 24 }} />
                <div className="fw-bold text-md">Back</div>
            </Link>
            {
                orders.length!==0 ?
                <div className="orders-flexbox">
                    {orders.map((order, index) => (
                        <Order key={index} order={order} onComplete={completeOrder}/>
                    ))}
                </div> :
                <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                    <div class="spinner-grow bg-panda-red" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            }
        </div>
    );
};

export default KitchenScreen;
