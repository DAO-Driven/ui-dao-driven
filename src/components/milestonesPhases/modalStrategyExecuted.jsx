
import React, { useState, useEffect } from 'react';

export const StrategyWasExecutedModal = ({ setShowModal, setOfferMilestonesModalClosed }) => {

    const closeModal = (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal-open')) {
            setShowModal(false);
        }
        window.location.reload();
    };

    const handleOk = () => {
        setShowModal(false);
        setOfferMilestonesModalClosed(true);
        window.location.reload();
    };

    return (
        <div className='modal-overlay' onClick={closeModal}>
        <div className='modal modal-open'>
            <div className='modal-content'>
                <span className='close' onClick={() => setShowModal(false)}>&times;</span>
                {/* <h2 style={h2Style}>New project details</h2> */}
                    <div>
                        <h2 style={h2Style} > 🎉🥳🎉 The strategy was fully executed 🎉🥳🎉</h2>
                        <p>Thank you for your vote! You can now find it in the Showcase Projects section</p>
                        <button onClick={handleOk} className="regular-button">OK</button>
                    </div>
            </div>
        </div>
        </div>
    );
};

const h2Style = {
    fontSize: '21px', 
    padding: "10px",
    color: "#8155BA",
};
