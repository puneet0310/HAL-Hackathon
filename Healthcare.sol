// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract HealthcareRecords {
    address owner;

    struct Record {
        uint256 recordID;
        string patientName;
        string diagnosis;
        string treatment;
        uint256 timestamp;
    }

    mapping(uint256 => Record[]) private patientRecords;
    mapping(address => bool) private authorizedProviders; // Stores authorized healthcare providers
    mapping(address => bool) private contractUsers; // Stores authorized contract users

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this function");
        _;
    }

    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Not an authorized provider");
        _;
    }

    modifier onlyAuthorizedUser() {
        require(contractUsers[msg.sender], "Not an authorized contract user");
        _;
    }

    constructor() {
        owner = msg.sender;  // The contract deployer is the owner
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    // Only owner can authorize healthcare providers
    function authorizeProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = true;
    }

    // Only owner can authorize contract users (you in this case)
    function authorizeContractUser(address user) public onlyOwner {
        contractUsers[user] = true;
    }

    // Contract user can add a record for a patient (but still authorized)
    function addRecord(uint256 patientID, string memory patientName, string memory diagnosis, string memory treatment) 
        public onlyAuthorizedUser
    {
        uint256 recordID = patientRecords[patientID].length + 1;
        patientRecords[patientID].push(Record(recordID, patientName, diagnosis, treatment, block.timestamp));
    }

    // Only authorized healthcare providers can view patient records
    function getPatientRecords(uint256 patientID) public view onlyAuthorizedProvider returns (Record[] memory) {
        return patientRecords[patientID];
    }

    // Function to check if the sender is authorized as a contract user
    function isContractUser(address user) public view returns (bool) {
        return contractUsers[user];
    }
}
