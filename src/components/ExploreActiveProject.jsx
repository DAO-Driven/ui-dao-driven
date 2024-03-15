import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import HatsContractABI from '../contracts/abis/HatsContractAbi.json';
import {MilestonesProgressBar} from "./MilesonesProgressBar";
import { ProgressBarVotes } from "./milestonesPhases/ProgressBarVotes"
import { Executor } from "./milestonesPhases/Executor";
import { Supplier } from "./milestonesPhases/Supplier"
import { RejectStrategyVoteModal } from "./modalVoteOnProjectReject";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const ExploreActiveProject = ({ profileId, setActiveProject }) => {
    const [web3, setWeb3] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [poolID, setPoolID] = useState(0);
    const [projectSuppliers, setProjectSuppliers] = useState([]);
    const [projecExecutor, setpPojecExecutor] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [offeredMilestones, setOfferedMilestones] = useState([]);
    const [projectMilestones, setProjectMilestones] = useState([]);
    const [offerMilestonesModalClosed, setOfferMilestonesModalClosed] = useState(false);
    const [offeredMilestonesVotes, setOfferedMilestonesVotes] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [milestonesWithStatus, setMilestonesWithStatus] = useState([]);
    const [projectRejectVotesFor, setProjectRejectVotesFor] = useState(0);
    const [projectRejectVotesAgainst, setProjectRejectVotesAgainst] = useState(0);
    const [suppliersRejectVotes, setSuppliersRejectVotes] = useState(0);
    const [totalSupply, setTotalSupply] = useState(null);
    const [projectInfo, setprojectInfo] = useState(null);
    const [openBackdrop, setOpenBackdrop] = React.useState(false);


    const handleBackButtonClick = () => {
        setActiveProject(false);
    };

    const checkHat = (address) => {
        try{

            // const web3Instance = new Web3(window.ethereum);
            // const fetchedAccounts = await web3Instance.eth.getAccounts();

            // const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);

            // const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
            // // console.log("=====> strategyAddress")
            // // console.log(strategyAddress)

            // const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

            // const supplierHat = await ExecutorSupplierVotingStrategy.methods.supplierHat().call();
            // console.log("Supplier Hat ID: ", supplierHat);

            // const executorHat = await ExecutorSupplierVotingStrategy.methods.executorHat().call();
            // console.log("Executor Hat ID: ", executorHat);

            // const hatsContract = new web3Instance.eth.Contract(HatsContractABI, hatsContractAddress);
    
            // const isSupplierHatWearer = await hatsContract.methods.isWearerOfHat(fetchedAccounts[0], supplierHat).call();
            // console.log("isSupplierHatWearer: ", isSupplierHatWearer);

            // const isExecutorWearer = await hatsContract.methods.isWearerOfHat(fetchedAccounts[0], executorHat).call();
            // console.log("isExecutorWearer: ", isExecutorWearer);

            // if (isExecutorWearer){
            //     return { label: "Executor HAT", isExecutor: true };
            // }
            // else if (isSupplierHatWearer){
            //     return { label: "Supplier HAT", isSupplier: true };
            // }
            // else{
            //     return { label: "no HAT", isExecutor: false, isSupplier: false };
            // }

        }
        catch(err){

            console.log("***** checkHat ERRROR")
            console.log(err)
        }


        if (projectSuppliers && projectSuppliers.includes(address)) {
            return { label: "Supplier HAT", isSupplier: true };
        }
        if (address === projecExecutor) {
            return { label: "Executor HAT", isExecutor: true };
        }
        return { label: "no HAT", isExecutor: false, isSupplier: false };
    }

    const calculatePhaseOneMilestones = () => {
        if (offeredMilestones.length && projectMilestones.length)
            return {progress: 100, info: "Confirmed"};
        else if (offeredMilestones.length)
            return {progress: 50, info: "Awaiting Review"};
        else    
            return {progress: 0, info: "Awaiting Offer"}; 
    }

    const calculateVotesPercentage = (totalValue, partialValue) => {
        if (totalValue == 0)
            return 0;
        return (partialValue / totalValue) * 100;
    }

    const youLabel = () => {

        if (projecExecutor){
            return (
                <span style={{
                    color: '#BEAFC2',
                    border: '1px solid #BEAFC2', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "RaxtorRegular",
                    marginRight: "10px",
                    fontSize: "11px"
                }}>
                    you
                </span>
            );
        }
        else    
            return "";
    };

    const milestoneStatusLabel = (status) => {
        if (status === 1) {
            return (
                <span style={{
                    color: 'orange',
                    border: '1px solid orange', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Pending
                </span>
            );
        }
        else if (status === 2){
            return (
                <span style={{
                    color: '#4caf50',
                    border: '1px solid #4caf50', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Accepted
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Rejected
                </span>
            );
        }
        // Add more conditions for other statuses if needed
    };

    const milestoneNameColor = (status, name) => {
        if (status === 1) {
            return (
                <span style={{
                    color: 'orange',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
        else if (status === 2) {
            return (
                <span style={{
                    color: '#4caf50',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
        else if (status === 3) {
            return (
                <span style={{
                    color: '#C70039',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
    };

    const handleRejectProjectButtonClick = async () => {
        setSuppliersRejectVotes(true);
    };

    useEffect(() => {        

        console.log(":::::::::: EXPLORE ACTIVE PROJECT PROFILE ID:", profileId)


        const initWeb3 = async () => {
            if (window.ethereum) {

                setOpenBackdrop(true);

                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                const fetchedAccounts = await web3Instance.eth.getAccounts();
                setAccounts(fetchedAccounts);

                let votingStrategyAddress;

                window.ethereum.on('accountsChanged', (newAccounts) => {
                    setAccounts(newAccounts);
                });

                try {

                    // console.log("=====> profileId")
                    // console.log(profileId)

                    const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                    // console.log("=====> strategyAddress")
                    // console.log(strategyAddress)

                    votingStrategyAddress = strategyAddress;

                    const supply = await managerContract.methods.getProjectSupply(profileId).call();
                    // console.log("=====> Project data")
                    // console.log(supply)

                    setProjectData(supply);

                    const projectSuppliers = await managerContract.methods.getProjectSuppliers(profileId).call();
                    // console.log("===== Project Suppliers")
                    // console.log(projectSuppliers)
                    setProjectSuppliers(projectSuppliers)

                } catch (error) {
                    console.error("Error fetching project data:", error);
                }

                const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, votingStrategyAddress);

                try{

                    const rejectVotesFor = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectVotesFor().call());
                    console.log("---> rejectVotesFor:", rejectVotesFor)
                    setProjectRejectVotesFor(rejectVotesFor);

                    const rejectVotesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectVotesAgainst().call());
                    console.log("---> rejectVotesAgainst:", rejectVotesAgainst)
                    setProjectRejectVotesAgainst(rejectVotesAgainst);

                    console.log("::::::: rejectManagerVotes for Account:", fetchedAccounts[0]);

                    const rejectManagerVotes = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectSupplierVotes(fetchedAccounts[0]).call());
                    console.log("---> rejectManagerVotes:", rejectManagerVotes)
                    // setProjectRejectVotesAgainst(rejectVotesAgainst);


                    const projectExecutor = await managerContract.methods.getProjectExecutor(profileId).call();
                    // console.log("===== Project Executor")
                    // console.log(projectExecutor)
                    setpPojecExecutor(projectExecutor);

                    const offeeredMilestones = await ExecutorSupplierVotingStrategy.methods.getOffeeredMilestones(projectExecutor).call();
                    // console.log("=====> Offeered Milestones")
                    // console.log(offeeredMilestones)
                    setOfferedMilestones(offeeredMilestones);

                    const milestones = await ExecutorSupplierVotingStrategy.methods.getMilestones(projectExecutor).call();
                    // console.log("=====> Milestones")
                    // console.log(milestones)
                    setProjectMilestones(milestones)

                    const strategyTotalSupply = Number(await ExecutorSupplierVotingStrategy.methods.totalSupply().call());
                    // console.log("=====> strategyTotalSupply")
                    // console.log(strategyTotalSupply)
                    setTotalSupply(strategyTotalSupply)

                    const projectHasPool = await managerContract.methods.getProjectPool(profileId).call();
                    setPoolID(Number(projectHasPool));
                    // console.log("::::::::ALLO V2 POOL:", projectHasPool)

                    const projectData = await managerContract.methods.getProfile(profileId).call();
                    // console.log("====== PROJECT DATA")
                    // console.log(projectData)
                    setprojectInfo(projectData);
                    

                    if (milestones.length){

                        const milestonesStatus = milestones.filter(milestn=> Number(milestn.milestoneStatus));

                        if (milestonesStatus.length){

                            const milestonesWithVotes = await Promise.all(milestonesStatus.map(async (milestone, index) => {
                                const votesFor = Number(await ExecutorSupplierVotingStrategy.methods.getSubmittedMilestonesVotesFor(index).call());
                                const votesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getSubmittedMilestonesVotesAgainst(index).call());
   
                                return {
                                    ...milestone,
                                    votesFor,  
                                    votesAgainst  
                                };
                            }));
                            
                            setMilestonesWithStatus(milestonesWithVotes);
                        }
                    }

                    if (offeeredMilestones){

                        const votesFor = Number(await ExecutorSupplierVotingStrategy.methods.getOfferedMilestonesVotesFor(projectExecutor).call());
                        // console.log("=====> offeeredMilestones Votes FOR")
                        // console.log(votesFor)

                        const votesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getOfferedMilestonesVotesAgainst(projectExecutor).call());
                        // console.log("=====> offeeredMilestones Votes AGAINST")
                        // console.log(votesAgainst)

                        if ((votesFor) || (votesAgainst))
                            setOfferedMilestonesVotes({votesFor: (votesFor), votesAgainst: (votesAgainst)});
                            // console.log("=====> MILESTONES VOTES")
                            // console.log(offeredMilestonesVotes)
                        }
                }
                catch (error) {
                    console.error("Error fetching Strategy data:", error);
                }

            } else {
                console.log("Please install MetaMask!");
            }

            setIsDataLoaded(true);
            setOpenBackdrop(false)
        };

        initWeb3();
    }, [offerMilestonesModalClosed]);

    return (
        <div>
            <div className='row'>
                {(
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={openBackdrop}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                )}
                {(projectData && projectInfo) && (
                    <div className='col-md-12' style={contentStyle}>
                        <div style={buttonContainerStyle}>
                            <button 
                                className="regular-button" 
                                onClick={handleBackButtonClick}
                            >
                                {"<<< Back to projects"}
                            </button>
                        </div>
                        <div>
                            <h3 style={h3Style}>{projectInfo.name}</h3>
                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 15,
                                    borderTopRightRadius: 15,
                                    borderBottomLeftRadius: 3,
                                    borderBottomRightRadius: 3,
                                    marginTop: '50px',
                                    marginBottom: '10px',
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Project description:</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                <a
                                                    href={projectInfo.metadata.pointer}
                                                    target="_blank" // This ensures the link opens in a new tab
                                                    rel="noopener noreferrer" // Security measure for links that open a new tab
                                                    
                                                    >
                                                    {projectInfo.metadata.pointer}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    borderBottomLeftRadius: 3,
                                    borderBottomRightRadius: 3,
                                    marginBottom: '10px',
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                Allo-V2 Registry Profile ID:
                                            </TableCell>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                Allo-V2 Pool Nr:
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                {profileId}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                {poolID}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer 
                                component={Paper} 
                                sx={{
                                    borderRadius: '5px', 
                                    overflow: 'hidden', 
                                    mb: 2,
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Recipients:</TableCell>
                                            {/* <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", }}>Required Funding</TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                            { projecExecutor == accounts[0] ? youLabel() : ""}{projecExecutor}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    borderBottomLeftRadius: 15,
                                    borderBottomRightRadius: 15,
                                    marginBottom: '50px',
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Managers:</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {projectSuppliers.map((manager) => (
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                   {manager == accounts[0] ? youLabel() : ""} {manager}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {
                                (projectRejectVotesFor || projectRejectVotesAgainst) ? (

                                    <TableContainer 
                                        component={Paper} 
                                        sx={{ 
                                            overflow: 'hidden',
                                            borderTopLeftRadius: 25,
                                            borderTopRightRadius: 25,
                                            borderBottomLeftRadius: 25,
                                            borderBottomRightRadius: 25,
                                            marginBottom: '10px',
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
                                        }}
                                    >
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                        Reject Projecting Votes:
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                {/* <MilestonesProgressBar completed={calculatePhaseOneMilestones().progress}/> */}
                                                <ProgressBarVotes 
                                                    completed={calculateVotesPercentage(totalSupply, projectRejectVotesFor)}
                                                    label={"For"}
                                                    color={"#C70039"}
                                                />
                                                <ProgressBarVotes 
                                                    completed={calculateVotesPercentage(totalSupply, projectRejectVotesAgainst)}
                                                    label={"Against"}
                                                    color={"#4caf50"}
                                                />
                                            </TableCell>

                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )
                                :
                                <div style={infoStyle}>
                                    <p></p>
                                </div>
                            }

{                           (isDataLoaded && checkHat(accounts[0]).isSupplier) && (
                                <>
                                    <p style={rejectInfoStyle}>As a Manager, you possess the authority to initiate a project rejection process, resulting in the project's closure and the return of funds to managers</p>
                                    <div style={milestonesFlexContainerStyle}>
                                        <button className="regular-button" onClick={() => {handleRejectProjectButtonClick()}}>
                                            Cast Your Vote
                                        </button>
                                    </div>
                                
                                </>
                            )}

                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 25,
                                    borderTopRightRadius: 25,
                                    borderBottomLeftRadius: 25,
                                    borderBottomRightRadius: 25,
                                    marginBottom: '10px',
                                    marginTop: '50px',
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                Milestones status: {calculatePhaseOneMilestones().info}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                        <MilestonesProgressBar completed={calculatePhaseOneMilestones().progress}/>
                                    </TableCell>

                                    </TableBody>
                                </Table>
                            </TableContainer>

                            { suppliersRejectVotes ? (
                                    <RejectStrategyVoteModal
                                        setSuppliersRejectVotes={setSuppliersRejectVotes}
                                        setOfferMilestonesModalClosed={setOfferMilestonesModalClosed}
                                        profileId={profileId}
                                    />
                                )
                                :
                                <div style={infoStyle}>
                                    <p></p>
                                </div>
                            }

                            {
                                (offeredMilestones.length && isDataLoaded) ? (
                                    <>
                                        {/* <p style={submitedMilestonesStyle}>Offered Milestones</p>
                                        <div style={milestonesFlexContainerStyle}>
                                            {offeredMilestones.map((milestone, i) => (
                                                <div key={`milestone-${i}`} style={{ minWidth: '200px' }}>
                                                    <p style={pStyle}>Milestone {i + 1}</p>
                                                    <p style={milestoneInfoStyle}>Percentage to distribute: {( Number(milestone.amountPercentage) / totalSupply) * 100}%</p>
                                                    <p style={milestoneInfoStyle}>Pointer: {milestone.metadata.pointer}</p>
                                                    <p style={milestoneInfoStyle}>Description: {milestone.description}</p>
                                                </div>
                                            ))}
                                        </div> */}


                                        <TableContainer 
                                            component={Paper} 
                                            sx={{ 
                                                // borderRadius: '25px', 
                                                overflow: 'hidden',
                                                borderTopLeftRadius: 25,
                                                borderTopRightRadius: 25,
                                                borderBottomLeftRadius: 3,
                                                borderBottomRightRadius: 3,
                                                marginBottom: '10px',
                                                marginTop: '50px',
                                                maxWidth: "90%",
                                                marginLeft: 'auto', // Adjust for centering
                                                marginRight: 'auto', // Adjust for centering
                                                display: 'block', // 
                                            }}
                                        >
                                            <Table aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="center" sx={{ fontSize: '17px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                            Offered Milestones
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>

                                                    {offeredMilestones.map((milestone, i) => (


                                                        <TableContainer 
                                                            component={Paper} 
                                                            sx={{ 
                                                                // borderRadius: '25px', 
                                                                overflow: 'hidden',
                                                                borderTopLeftRadius: 15,
                                                                borderTopRightRadius: 15,
                                                                borderBottomLeftRadius: 15,
                                                                borderBottomRightRadius: 15,
                                                                marginBottom: '10px',
                                                                maxWidth: "100%",
                                                                marginLeft: 'auto', // Adjust for centering
                                                                marginRight: 'auto', // Adjust for centering
                                                                display: 'block', // 
                                                            }}
                                                        >
                                                            <Table aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                                            Milestone {i + 1}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                            Distributing: {(Number(milestone.amountPercentage) / totalSupply) * 100}%
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                            Description: .
                                                                            <a
                                                                                href={milestone.description}
                                                                                target="_blank" // This ensures the link opens in a new tab
                                                                                rel="noopener noreferrer" // Security measure for links that open a new tab
                                                                                
                                                                                >
                                                                                {milestone.description}
                                                                            </a> 
                                                                        </TableCell>
                                                                    </TableRow>

                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    ))}
                                                </TableCell>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>






                                        {(offeredMilestonesVotes && isDataLoaded) && (


                                            // <div style={milestonesFlexContainerStyle}>
                                            //     <div style={progressBarVotesForContainerStyle}>
                                            //             <p style={infoStyle}>Offered Milestones Votes</p>
                                            //             <ProgressBarVotes 
                                            //                 completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesFor)}
                                            //                 label={"Votes For"}
                                            //                 color={"#4caf50"}
                                            //             />
                                            //             <ProgressBarVotes 
                                            //                 completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesAgainst)}
                                            //                 label={"Votes Against"}
                                            //                 color={"#C70039"}
                                            //             />
                                            //     </div>
                                            // </div>


                                            <TableContainer 
                                            component={Paper} 
                                            sx={{ 
                                                // borderRadius: '25px', 
                                                overflow: 'hidden',
                                                borderTopLeftRadius: 3,
                                                borderTopRightRadius: 3,
                                                borderBottomLeftRadius: 25,
                                                borderBottomRightRadius: 25,
                                                marginBottom: '10px',
                                                maxWidth: "90%",
                                                marginLeft: 'auto', // Adjust for centering
                                                marginRight: 'auto', // Adjust for centering
                                                display: 'block', // 
                                            }}
                                            >
                                                <Table aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                                Milestones Defining Votes
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>

                                                        
                                                        <ProgressBarVotes 
                                                            completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesFor)}
                                                            label={"Votes For"}
                                                            color={"#4caf50"}
                                                        />
                                                        <ProgressBarVotes 
                                                            completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesAgainst)}
                                                            label={"Votes Against"}
                                                            color={"#C70039"}
                                                        />

                                                    </TableCell>

                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }

                            {
                                (milestonesWithStatus.length && isDataLoaded) ? (
                                    <>
                                        <p style={submitedMilestonesStyle}>Submited Milestones</p>
                                        <div style={milestonesFlexContainerStyle}>
                                            {milestonesWithStatus.map((milestone, i) => (
                                                <div key={`milestone-${i}`} style={{ minWidth: '200px' }}>
                                                    <p style={pStyle}>{milestoneNameColor(Number(milestone.milestoneStatus), `Milestone ${i + 1}`)}</p>
                                                    <p style={milestoneInfoStyle}>Percentage to distribute: {( Number(milestone.amountPercentage) / totalSupply) * 100}%</p>
                                                    <p style={milestoneInfoStyle}>Description: {milestone.description}</p>
                                                    <p style={milestoneInfoStyle}>Description: {milestone.metadata.pointer}</p>
                                                    <p style={milestoneInfoStyle}>Status: {milestoneStatusLabel(Number(milestone.milestoneStatus))}</p>
                                                    <div style={milestonesFlexContainerStyle}>
                                                    <div style={progressBarVotesForContainerStyleSmall}>
                                                            {/* <p style={infoStyle}>Milestone's Votes</p> */}
                                                            <ProgressBarVotes 
                                                                completed={calculateVotesPercentage(totalSupply, milestone.votesFor)}
                                                                label={"For"}
                                                                color={"#4caf50"}
                                                            />
                                                            <ProgressBarVotes 
                                                                completed={Number(milestone.milestoneStatus) != 3 ? calculateVotesPercentage(totalSupply, milestone.votesAgainst) : 100}
                                                                label={"Against"}
                                                                color={"#C70039"}
                                                            />
                                                    </div>
                                                </div>

                                                </div>
                                            ))}

                                        </div>
                                    </>
                                )
                                
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }

                            {isDataLoaded && checkHat(accounts[0]).isExecutor && (
                                <Executor
                                    setOfferMilestonesModalClosed={setOfferMilestonesModalClosed}
                                    projecExecutor={projecExecutor}
                                    profileId={profileId}
                                />
                            )}
                            {(isDataLoaded && checkHat(accounts[0]).isSupplier) && (
                                <Supplier
                                    projecExecutor={projecExecutor}
                                    setOfferMilestonesModalClosed={setOfferMilestonesModalClosed}
                                    supplierAddress={accounts[0]}
                                    profileId={profileId}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const fundingStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '0px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
};

const infoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const rejectInfoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '100px',
    marginLeft: '100px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const submitedMilestonesStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
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

const progressBarVotesForContainerStyle = {
    width: '50%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const progressBarVotesForContainerStyleSmall = {
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const contentStyle = {
    fontSize: '21px',
    marginTop: '50px',
    marginBottom: '20px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    // border: '1px solid black',
    borderRadius: "15px",
    width: "100%",
    paddingTop: '30px',
    paddingBottom: '10px',
    // alignItems: 'center', 
    // height: '500px', 
};

const h3Style = { 
    fontSize: '24px', 
    fontWeight: 'bold',
    fontFamily: "FaunaRegular",
};

const pStyle = { 
    fontSize: '16px',
    marginLeft: '30px', 
};

const buttonContainerStyle = {
    textAlign: 'left', // Aligns the button to the left
    paddingTop: '20px',
    // paddingBottom: '20px'
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
