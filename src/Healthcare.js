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
  const contractAddress = "0xc16Bc87D0E3Df0AACf27CeeC241f2dA9fA25C008";

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
          internalType: "struct HealthcareRecords.Record[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  // Button handler for connecting MetaMask
  const btnhandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => accountChangeHandler(res[0]));
    } else {
      alert("Please install MetaMask.");
    }
  };

  // Handle account change and fetch balance
  const accountChangeHandler = (account) => {
    setAccount(account);
    getbalance(account);
    fetchContractDetails(account);
  };

  // Get the balance of the connected account
  const getbalance = (address) => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance) => {
        setBalance(ethers.utils.formatEther(balance));
      });
  };

  // Fetch contract details like owner
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

      // Fetch contract owner
      const ownerAddress = await contractInstance.getOwner();
      setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
    } catch (error) {
      console.error("Error fetching contract details:", error);
      // Show specific error message to the user
      if (error.code === "CALL_EXCEPTION") {
        alert(
          "Error calling getOwner: The contract may be misconfigured or inaccessible."
        );
      } else {
        alert(`Error fetching contract details: ${error.message}`);
      }
    }
  };

  // Fetch patient records
  const fetchPatientRecords = async () => {
    try {
      const records = await contract.getPatientRecords(patientID);
      setPatientRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error);
      alert("Error fetching patient records. Please try again.");
    }
  };

  // Add a new record to the contract
  const addRecord = async () => {
    try {
      const tx = await contract.addRecord(
        patientID,
        "Alice",
        diagnosis,
        treatment
      );
      await tx.wait();
      fetchPatientRecords();
      alert("Record added successfully.");
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Error adding record. Please try again.");
    }
  };

  // Authorize a healthcare provider
  const authorizeProvider = async () => {
    if (isOwner) {
      try {
        const tx = await contract.authorizeProvider(providerAddress);
        await tx.wait();
        alert(`Provider ${providerAddress} authorized successfully.`);
      } catch (error) {
        console.error("Error authorizing provider:", error);
        alert("Error authorizing provider. Please try again.");
      }
    } else {
      alert("Only contract owner can authorize providers.");
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

          <div className="records-section">
            <h2>Patient Records</h2>
            {patientRecords.length > 0 ? (
              patientRecords.map((record, index) => (
                <div key={index}>
                  <p>Record ID: {record.recordID.toNumber()}</p>
                  <p>Diagnosis: {record.diagnosis}</p>
                  <p>Treatment: {record.treatment}</p>
                  <p>
                    Timestamp:{" "}
                    {new Date(
                      record.timestamp.toNumber() * 1000
                    ).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No records found for this patient.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Healthcare;
