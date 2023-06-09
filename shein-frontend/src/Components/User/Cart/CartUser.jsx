import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { deleteCart, getCart, updateCartQuantity } from '../../../redux/API/apiRequestcart';
import { useParams, useNavigate } from 'react-router-dom';
import PayButton from './PayButton'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cartUser.scss';

const CartUser = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.login.currentUser);
  const carts = useSelector((state) => state.carts.cartItems?.allCart);
  const accessToken = user?.accessToken;
  const msg = useSelector((state) => state.carts?.msg);

  const handleDeleteCart = (productId) => {
    deleteCart(productId, dispatch, userId)
      .then(() => {
        getCart(accessToken, dispatch, userId);
        toast.success('Sản phẩm đã được xóa khỏi giỏ hàng', { autoClose: 3000 });
      });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      handleDeleteCart(productId); // Xóa sản phẩm nếu quantity xuống 0
    } else {
      updateCartQuantity(userId, productId, newQuantity, dispatch)
        .then(() => {
          getCart(accessToken, dispatch, userId);
        })
        .catch((error) => {
          // Handle the error here, such as displaying an error message
          console.log(error);
        });
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (!carts) {
      navigate('/');
    }
    if (user?.accessToken) {
      getCart(accessToken, dispatch, userId);
    }
  }, [userId]);
  const calculateSubtotal = (products) => {
    let subtotal = 0;
    if (products) {
      for (const product of products) {
        subtotal += product.price * product.quantity;
      }
    }
    return subtotal;
  };
  return (
    <div>
      {carts?.products.length > 0 ? (
        <div className="cart-wrapper">
          <div className="cart-container">
            <h2 className="cart-title">Giỏ hàng</h2>
            <div className="cart-product-list">
              {carts.products.map((product) => (
                <div className="cart-product" key={product.productId}>
                  <div className="cart-product-image">
                    <img src={product.img} alt={product.name} />
                  </div>
                  <div className="cart-product-details">
                    <h3 className="cart-product-name">{product.name}</h3>
                    <div className="cart-product-quantity">
                      <button onClick={() => handleUpdateQuantity(product.productId, product.quantity - 1)}>-</button>
                      <span>{product.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(product.productId, product.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-product-price">${product.price}</div>
                    <button className="cart-product-delete" onClick={() => handleDeleteCart(product.productId)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span className="cart-total-label">Tổng tiền:</span>
              <span className="cart-total-amount">${calculateSubtotal(carts.products)}</span>
            </div>
            <PayButton cartItems={carts} />
            <ToastContainer />
          </div>
        </div>
      ) : (
        <div className="empty-cart-message">Không có sản phẩm nào trong giỏ hàng</div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CartUser;
