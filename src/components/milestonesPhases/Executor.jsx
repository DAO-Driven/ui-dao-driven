import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { OfferMilestones } from "./OfferMilestonesModal";
import ExecutorSupplierVotingStrategyABI from '../../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import ManagerContractABI from '../../contracts/abis/managerContractAbi.json';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';

const {managerContractAddress} = require('../../contracts/contractsAddresses.json');


export const Executor = ({ setOfferMilestonesModalClosed, projecExecutor, profileId }) => {

    const [showOfferMilestonesModal, setShowOfferMilestonesModal] = useState(false);
    const [upcomingMilestone, setUpcomingMilestone] = useState(false);
    const [upcomingMilestoneIndex, setUpcomingMilestoneIndex] = useState(false);
    const [pendingMilestone, setPendingMilestone] = useState(false);
    const [submited, setSubmited] = useState(null);
    const [milestonePointer, setMilestonePointer] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(null);
    const [offeredMilestones, setOfferedMilestones] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {

        const web3Instance = new Web3(window.ethereum);

        try {

            const initWeb3 = async () => {

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                // console.log("=====> strategyAddress")
                // console.log(strategyAddress)

                const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

                const projectMilestones = await ExecutorSupplierVotingStrategy.methods.getMilestones(projecExecutor).call();
                // console.log("=====> Milestones")
                // console.log(projectMilestones)

                const offeeredMilestones = await ExecutorSupplierVotingStrategy.methods.getOffeeredMilestones(projecExecutor).call();
                // console.log("=====> Offeered Milestones")
                // console.log(offeeredMilestones)
                setOfferedMilestones(offeeredMilestones);

                if (projectMilestones.length){

                    const pendingMilestone = projectMilestones.find(milestone=> Number(milestone.milestoneStatus) == 1);
                    setPendingMilestone(pendingMilestone);

                    const upcommingMilestones = await ExecutorSupplierVotingStrategy.methods.getUpcomingMilestone(projecExecutor).call();
                    // console.log("===== upcommingMilestones")
                    // console.log(upcommingMilestones)
    
                    setUpcomingMilestoneIndex(Number(upcommingMilestones));
    
                    setUpcomingMilestone(projectMilestones[Number(upcommingMilestones)]);
                }

                setIsDataLoaded(true);
            }
            initWeb3();
        }
        catch(err){
            console.log("***** GET UPCOMMING MILESTONE ERROR");
            console.log(err);
        }
    }, [showOfferMilestonesModal]);


    const submitMilestone = async () => {
        setLoading(true);
        try{
            const web3Instance = new Web3(window.ethereum);
            const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
            const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
            // console.log("=====> strategyAddress")
            // console.log(strategyAddress)

            const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

            const nonce = await web3Instance.eth.getTransactionCount(projecExecutor, 'latest');

            const metadata = {
                protocol: 1,
                pointer: milestonePointer
            };

            const tx = {
                from: projecExecutor,
                to: strategyAddress,
                nonce: web3Instance.utils.toHex(nonce),
                data: ExecutorSupplierVotingStrategy.methods.submitMilestone(
                    projecExecutor,
                    upcomingMilestoneIndex,
                    metadata
                ).encodeABI()
            };

            const estimatedGas = await web3Instance.eth.estimateGas(tx);
            // console.log("==========> ESITMATED GAS LIMIT")
            // console.log(estimatedGas)

            const gasLimit = Math.floor(Number(estimatedGas) * 1.1);
            tx.gas = gasLimit;

            const sentTx = await web3Instance.eth.sendTransaction(tx);
            const txReceipt = await web3Instance.eth.getTransactionReceipt(sentTx.transactionHash);

            // console.log("========> txReceipt <===========")
            // console.log(txReceipt)

            setSubmited(true);
            setOfferMilestonesModalClosed(true);
        }
        catch(err){
            console.log("***** MILESTONE SUBMITION ERROR");
            console.log(err);
        }
        setLoading(false);
    }

    return (
        <>
            {loading ? (
                <div style={loadingBarContainerStyle}>
                    <div className="loader"></div>
                </div>
            ) : (
            <div style={progressBarContainerStyle}>
                {(isDataLoaded && !upcomingMilestone) && (


                    <TableContainer 
                        component={Paper} 
                        sx={{ 
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,
                            borderBottomLeftRadius: 25,
                            borderBottomRightRadius: 25, 
                            overflow: 'hidden', 
                            mb: 2,
                            maxWidth: "80%",
                            marginLeft: 'auto', // Adjust for centering
                            marginRight: 'auto', // Adjust for centering
                            display: 'block', // 
                        }}
                    >
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "orange" }}>! Action Required</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                        {/* <CircularProgressWithLabel value={calculateProgress(projecData, web3)} /> */}

                                        <p style={thanksgivingStyle}>As a holder of the Executor Hat, you have the authority to propose milestones for the project</p>

                                    </TableCell>
                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 0 }}>
                                        
                                        <Button
                                            variant="contained"
                                            sx={{ 
                                                mt: 1, 
                                                width: 250, 
                                                height: '50px', 
                                                backgroundColor: "#BEAFC2", 
                                                '&:hover': { 
                                                    backgroundColor: "#BEAFC2"
                                                }, 
                                                fontFamily: "FaunaRegular",
                                                borderTopLeftRadius: 3,
                                                borderTopRightRadius: 3,
                                                borderBottomLeftRadius: 15,
                                                borderBottomRightRadius: 15,
                                                fontSize: '11px'
                                            }}
                                            // disabled={!Number(amountToSend)}
                                            onClick={() => { setShowOfferMilestonesModal(true)}}
                                        >
                                            {offeredMilestones.length ? "Reoffer Milestones" : "Offer Milestones"}
                                        </Button>
                                    </Box>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>





                    // <div>
                    //     <p style={infoStyle}>As a holder of the Executor Hat, you have the authority to propose milestones for the project</p>
                    //     <button className="regular-button" onClick={() => {setShowOfferMilestonesModal(true)}}>
                    //         {offeredMilestones.length ? "Reoffer Milestones" : "Offer Milestones"}
                    //     </button>
                    // </div>


                )}
                {(isDataLoaded && upcomingMilestone && !submited && !pendingMilestone) && (
                    <div>
                        <p style={infoStyle}>As a holder of the Executor Hat, you have the authority to submit upcoming milestones of the project</p>
                        <div style={milestonesFlexContainerStyle}>
                            <div key={`milestone-${upcomingMilestoneIndex}`} style={{ minWidth: '200px' }}>
                                <p style={pStyle}>Milestone {upcomingMilestoneIndex + 1}</p>
                                <p style={milestoneInfoStyle}>Percentage to distribute: {upcomingMilestone.amountPercentage}%</p>
                                {upcomingMilestone.metadata && (
                                    <p style={milestoneInfoStyle}>Pointer: {upcomingMilestone.metadata.pointer}</p>
                                )}
                                <p style={milestoneInfoStyle}>Description: {upcomingMilestone.description}</p>
                                <p style={pointerLabelStyle}>milestone's link</p>
                                <input 
                                    type="text" 
                                    name="description" 
                                    // value={milestonePointer}
                                    style={inputStyle} onChange={(e) => setMilestonePointer(e.target.value)}
                                />
                                <button className="regular-button" onClick={() => {submitMilestone()}}>
                                    Submit Milestone
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {submited && (
                    <div>
                        <p style={infoStyle}>Your milestone submission was successful. Please stay tuned for updates on its status and voting progress</p>
                    </div>
                )}
                {pendingMilestone && !submited && (
                    <div>
                        <p style={infoStyle}>Please wait until your submitted milestone is reviewed before submitting a new one</p>
                        <p style={infoStyle}>Alternatively, you can resubmit the last milestone if the suppliers' votes are divided</p>
                        <input 
                            type="text" 
                            name="description" 
                            // value={milestonePointer}
                            style={inputStyle} onChange={(e) => setMilestonePointer(e.target.value)}
                        />
                        <button className="regular-button" onClick={() => {submitMilestone()}}>
                            Resubmit Milestone
                        </button>
                    </div>
                )}
                {showOfferMilestonesModal && (
                    <OfferMilestones 
                        setShowModal={setShowOfferMilestonesModal} 
                        setOfferMilestonesModalClosed={setOfferMilestonesModalClosed}
                        profileId={profileId}
                    />
                )}
            </div>
            )}
        </>
        
    )

}

const infoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
};

const pointerLabelStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '1px',
    fontFamily: "RaxtorRegular",
    // marginRight: '25px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const progressBarContainerStyle = {
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const milestoneInfoStyle = {
    fontSize: '13px',
    color: "#281C2D",
    padding: '1px 16px',
};

const milestonesFlexContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const pStyle = { 
    fontSize: '16px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const inputStyle = {
    width: '90%', 
    padding: '4px', 
    margin: '10px 0', 
    borderRadius: '10px', 
    border: '1px solid #ccc', 
    boxSizing: 'border-box',
    marginBottom: '30px',
    color: "#8155BA",
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const thanksgivingStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '30px',
    marginLeft: '30px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

