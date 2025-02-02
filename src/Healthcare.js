import React, { useState } from "react";
import { ethers } from "ethers";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const Healthcare = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isOwner, setIsOwner] = useState(null);
  const [patientID, setPatientID] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);
  const [providerAddress, setProviderAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const contractAddress = "0x5a93Ce1278bAA8f6853E0e35ABB63fd438129837";

  const contractABI = [
    {
      inputs: [
        { internalType: "uint256", name: "patientID", type: "uint256" },
        { internalType: "string", name: "patientName", type: "string" },
        { internalType: "string", name: "diagnosis", type: "string" },
        { internalType: "string", name: "treatment", type: "string" },
      ],
      name: "addRecord",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "provider", type: "address" }],
      name: "authorizeProvider",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "patientID", type: "uint256" }],
      name: "getPatientRecords",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "recordID", type: "uint256" },
            { internalType: "string", name: "patientName", type: "string" },
            { internalType: "string", name: "diagnosis", type: "string" },
            { internalType: "string", name: "treatment", type: "string" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
          ],
          internalType: "tuple[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const btnhandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => accountChangeHandler(res[0]))
        .catch((err) => {
          alert("Error connecting to MetaMask.");
          console.error(err);
        });
    } else {
      alert("Please install MetaMask.");
    }
  };

  const accountChangeHandler = (account) => {
    setAccount(account);
    getbalance(account);
    fetchContractDetails(account);
  };

  const getbalance = (address) => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance) => {
        setBalance(ethers.utils.formatEther(balance));
      })
      .catch((err) => {
        console.error("Error fetching balance:", err);
        setBalance(null);
      });
  };

  const fetchContractDetails = async (accountAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);

      // Fetch contract owner using hardcoded address for debugging
      const ownerAddress = "0xYourOwnerAddressHere"; // Hardcode your owner's address for debugging.
      setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
    } catch (error) {
      console.error("Error fetching contract details:", error);
      alert(
        "Error calling getOwner: The contract may be misconfigured or inaccessible."
      );
    }
  };

  // Fetch Patient Records
  const fetchPatientRecords = async () => {
    if (!contract || !patientID) {
      alert("Please connect to the contract and enter a valid patient ID.");
      return;
    }

    try {
      const records = await contract.getPatientRecords(patientID);
      setPatientRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error);
    }
  };

  // Add Record
  const addRecord = async () => {
    if (!contract || !diagnosis || !treatment || !patientID) {
      alert("Please fill in all the fields.");
      return;
    }

    try {
      await contract.addRecord(patientID, account, diagnosis, treatment);
      alert("Record added successfully!");
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  // Authorize Provider
  const authorizeProvider = async () => {
    if (!contract || !providerAddress) {
      alert("Please provide a valid provider address.");
      return;
    }

    try {
      await contract.authorizeProvider(providerAddress);
      alert("Provider authorized successfully!");
    } catch (error) {
      console.error("Error authorizing provider:", error);
    }
  };

  return (
    <div className="App">
      <Card className="text-center">
        <Card.Header>
          <strong>Address: </strong>
          {account || "Not connected"}
        </Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>Balance: </strong>
            {balance !== null ? balance : "Loading..."}
          </Card.Text>
          <Button onClick={btnhandler} variant="primary">
            Connect to Wallet
          </Button>
        </Card.Body>
      </Card>

      {account && (
        <>
          <div className="form-section">
            <h2>Fetch Patient Records</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Enter Patient ID"
              value={patientID}
              onChange={(e) => setPatientID(e.target.value)}
            />
            <button className="action-button" onClick={fetchPatientRecords}>
              Fetch Records
            </button>
          </div>

          <div className="form-section">
            <h2>Add Patient Record</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            />
            <button className="action-button" onClick={addRecord}>
              Add Record
            </button>
          </div>

          <div className="form-section">
            <h2>Authorize HealthCare Provider</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Provider Address"
              value={providerAddress}
              onChange={(e) => setProviderAddress(e.target.value)}
            />
            <button className="action-button" onClick={authorizeProvider}>
              Authorize Provider
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Healthcare;
