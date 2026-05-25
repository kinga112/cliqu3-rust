use alloy::{
    hex::FromHex,
    network::EthereumWallet,
    primitives::{Address, Bytes, U256, address, utils::format_units},
    providers::{Provider, ProviderBuilder},
    rpc::types::{TransactionInput, TransactionRequest},
    signers::local::PrivateKeySigner,
    sol,
};
use anyhow::Result;
use reqwest::{Error, Response};
use serde::Deserialize;

use crate::config;
use crate::xmtp::MemberProfile;

const CONTRACT_ADDRESS: Address = address!("0x525c2aba45f66987217323e8a05ea400c65d06dc");

#[derive(Deserialize, Debug)]
// This tells Serde to automatically map "Symbol" to "symbol", "Price" to "price", etc.
#[serde(rename_all = "PascalCase")]
struct EthResponse {
    symbol: String,
    name: String,
    address: String,
    blockchain: String,
    price: f64,
    // "PriceYesterday" maps seamlessly to price_yesterday
    price_yesterday: f64,
    // Note: For fields ending in an acronym like USD, PascalCase rules can sometimes get tricky.
    // If "VolumeYesterdayUSD" throws a missing field error, explicitly override it using the line below:
    #[serde(rename = "VolumeYesterdayUSD")]
    volume_yesterday_usd: f64,
    time: String,
    source: String,
    signature: String,
}

// 1. Define the contract interface using the sol! macro
// sol! {
//     #[sol(rpc)] // Enables the generation of provider-compatible methods
//     interface ICliqueProfile {
//         struct Profile {
//             address walletAddress;
//             string username;
//             string bio;
//             string avatarUrl;
//         }

//         // Getters (view functions)
//         function getWalletAddress() external view returns (address);
//         function getUsername() external view returns (string memory);
//         function getBio() external view returns (string memory);
//         function getAvatarUrl() external view returns (string memory);

//         // Setters
//         function setWalletAddress(address new_address) external;
//         function setUsername(string calldata new_username) external;
//         function setBio(string calldata new_bio) external;
//         function setAvatarUrl(string calldata new_avatar_url) external;

//         // Combined initialization function
//         function createProfile(
//             address new_address,
//             string calldata new_username,
//             string calldata new_bio,
//             string calldata new_avatar_url
//         ) external;
//     }
// }

sol! {
    #[sol(rpc)] // Enables the generation of provider-compatible methods
    interface ICliqueProfile {
        // The individual profile structure returned by the single-call getter
        struct Profile {
            address walletAddress;
            string username;
            string bio;
            string avatarUrl;
        }

        // ==========================================
        // Getters (View functions) - NOW TAKE A USER ADDRESS
        // ==========================================
        function getWalletAddress(address user) external view returns (address);
        function getUsername(address user) external view returns (string memory);
        function getBio(address user) external view returns (string memory);
        function getAvatarUrl(address user) external view returns (string memory);

        // This is your single-call optimization lookup!
        function getProfile(address user) external view returns ((address, string, string, string) memory);

        // ==========================================
        // Setters - REMOVED ADDRESS PARAMETERS (Handled via msg.sender)
        // ==========================================
        function setUsername(string calldata new_username) external;
        function setBio(string calldata new_bio) external;
        function setAvatarUrl(string calldata new_avatar_url) external;

        // Combined profile initialization function
        function createProfile(
            string calldata new_username,
            string calldata new_bio,
            string calldata new_avatar_url
        ) external;
    }
}

pub async fn create_profile(username: String, bio: String, avatar: String) -> Result<()> {
    let signer: PrivateKeySigner = config::PRIVATE_KEY.parse()?;

    let address = signer.address();
    println!("ADDRESS FOR THIS TRANSACTION: {:?}", address);

    let provider = ProviderBuilder::new()
        .wallet(signer)
        .connect("http://localhost:8547")
        .await
        .expect("failed to create signer");

    // 3. Initialize the contract instance
    // let contract_address = address!("0xcEcba2F1DC234f70Dd89F2041029807F8D03A990");
    let contract = ICliqueProfile::new(CONTRACT_ADDRESS, provider);

    println!("Creating new profile with username: {:?}", username);
    // This broadcasts the transaction to the network
    // let tx_builder = contract.setUsername(username);
    let tx_builder = contract.createProfile(username, bio, avatar);
    let pending_tx = tx_builder
        .send()
        .await
        .expect("failed to build pending tx 1");

    println!("Transaction sent! Hash: {}", pending_tx.tx_hash());

    // 4. Wait for the transaction to be mined
    let receipt = pending_tx.get_receipt().await?;

    println!("Transaction confirmed in block: {:?}", receipt.block_number);

    Ok(())
}

pub async fn update_profile(
    username: Option<String>,
    description: Option<String>,
    pic: Option<String>,
) -> Result<()> {
    let signer: PrivateKeySigner = config::PRIVATE_KEY.parse()?;
    let provider = ProviderBuilder::new()
        .wallet(signer)
        .connect("http://localhost:8547")
        .await?;

    // 3. Initialize the contract instance
    // let contract_address = address!("0xcEcba2F1DC234f70Dd89F2041029807F8D03A990");
    let contract = ICliqueProfile::new(CONTRACT_ADDRESS, provider);

    println!(
        "Updating profile with username:  {:?}",
        username.clone().unwrap()
    );
    // This broadcasts the transaction to the network
    let tx_builder = contract.setUsername(username.unwrap());
    let pending_tx = tx_builder.send().await.expect("failed to build pending tx");
    println!("Transaction sent! Hash: {:?}", pending_tx.tx_hash());

    // 4. Wait for the transaction to be mined
    let receipt = pending_tx.get_receipt().await?;

    println!("Transaction confirmed in block: {:?}", receipt.block_number);

    Ok(())
}

pub async fn test_contract() -> Result<()> {
    // let provider = ProviderBuilder::new().connect("http://localhost:8547").await?;

    // // Instantiate the contract instance.
    // let contract_address = address!("0x4a2ba922052ba54e29c5417bc979daaf7d5fe4f4");
    // let contract = ICliqueProfile::new(contract_address, provider);

    // let wallet_address = contract.get_wallet_address().call().await?;
    // println!("Current wallet address value: {}", wallet_address);

    // Ok(())
    //

    // let rpc_url = "http://localhost:8547".parse()?;

    // 2. Configure the wallet signer (Matches your dev private key)
    // let signer = PrivateKeySigner::from_str(config::PRIVATE_KEY)?;
    // let wallet = EthereumWallet::from(signer);

    // 3. Build the HTTP provider with wallet capabilities attached
    let signer: PrivateKeySigner = config::PRIVATE_KEY.parse()?;

    let provider = ProviderBuilder::new()
        // .with_gas_estimation()
        .wallet(signer)
        .connect("http://localhost:8547")
        .await
        .expect("failed to build provider");

    // let provider = ProviderBuilder::new()
    //     .wallet(signer)
    //     .connect("http://localhost:8547")
    //     .await
    //     .expect("failed to build provider");

    // GET doesnt need a signer! Need signer for updating which is done below..
    // let provider = ProviderBuilder::new()
    //     .connect("http://localhost:8547")
    //     .await
    //     .expect("failed to build provider");

    // 4. Point to your active contract address
    // let contract_address = address!("0xcEcba2F1DC234f70Dd89F2041029807F8D03A990");

    // 5. Initialize the type-safe contract instance
    let contract = ICliqueProfile::new(CONTRACT_ADDRESS, &provider);

    // ==========================================
    // PATH A: EXECUTING A "CALL" (Read State)
    // ==========================================
    // println!("Fetching current username...");

    // `.call()` simulates an eth_call on the node (No gas spent, reads data)
    // let current_username = contract
    //     .getUsername()
    //     .call()
    //     .await
    //     .expect("failed to get current username");
    // let current_username = contract.getUsername().call().await?._0;
    // println!("Current Username in Contract: {:?}", current_username);

    // ==========================================
    // PATH B: EXECUTING A "SEND" (Write State)
    // ==========================================
    // println!("Sending transaction to change username...");
    // let new_name = String::from("Cliqu3User");
    let current_gas_price = provider
        .get_gas_price()
        .await
        .expect("failed to get gas price");
    println!("Current Gas Price: {} Gwei", current_gas_price);

    // `.send()` constructs, signs, and broadcasts an actual transaction to the network
    // let tx_builder = contract.setUsername(new_name.clone());
    // let pending_tx = tx_builder.send().await.expect("failed to build pending tx");
    // println!("Transaction sent! Hash: {:?}", pending_tx.tx_hash());
    //
    // let contract_address = address!(DEPLOYED_ADDRESS);

    // let call_data = setUsernameCall {
    //     new_username: String::from("Cliqu3User"),
    // }
    // .abi_encode();

    // let bytes = Bytes::from("TestUser");
    // let input = TransactionInput {
    //     input: Some(bytes),
    //     data: None,
    // };
    //
    //

    let test_string = String::from(
        r#"data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="%237F5AF0"/><circle cx="100" cy="85" r="35" fill="%23ffffff" opacity="0.3"/><text x="100" y="150" font-family="monospace" font-size="16" fill="%23ffffff" font-weight="bold" text-anchor="middle">cliqu3_dev</text></svg>"#,
    );
    let estimated_gas_units = contract
        .createProfile(
            "NewUserName".to_string(),
            "Some BIO... boring..".to_string(),
            test_string,
        )
        .estimate_gas()
        .await
        .expect("could not estimate gas");
    // let tx = TransactionRequest::default()
    // .to(CONTRACT_ADDRESS)
    // .input(input);

    // let estimated_gas_units = provider
    //     .estimate_gas(tx)
    //     .await
    //     .expect("failed to estimate gas");
    println!("Estimated Gas Units needed: {}", estimated_gas_units);

    // 4. Compute Total Price
    let total_cost_wei = current_gas_price * estimated_gas_units as u128;
    // println!("Total Transaction Cost: {} ETH", total_cost_wei);
    let total_cost_eth: String = format_units(total_cost_wei, "ether")?;
    println!("Total Transaction Cost: {} ETH", total_cost_eth);
    // 4. Calculate USD estimate inline
    let eth_as_f64: f64 = total_cost_eth.parse().unwrap_or(0.0);
    let eth_price_usd = 2110.0; // Hardcoded spot estimate
    let url = "https://api.diadata.org/v1/assetQuotation/Ethereum/0x0000000000000000000000000000000000000000";
    let response: Response = reqwest::get(url).await.expect("failed to get eth price");
    let eth_json: EthResponse = response.json().await.expect("failed to get eth json");
    // let price: String = response.json().await.expect("failed to get json")["Price"];
    // let price: String = response.json()["Price"].await.expect("failed to get json");
    println!("Eth price found: {:?}", eth_json.price);
    println!(
        "Total Transaction Cost: ${:.5} USD",
        eth_as_f64 * eth_json.price
    );

    // Wait for the block to be mined by your local Nitro node
    // let receipt = pending_tx.get_receipt().await?;
    // println!(
    //     "Transaction successfully mined in block number: {:?}",
    //     receipt.block_number
    // );

    // // Verify the change stuck
    // let updated_username = contract
    //     .getUsername()
    //     .call()
    //     .await
    //     .expect("failed to get updated username");
    // println!("Updated Username in Contract: {:?}", updated_username);

    Ok(())
}

pub async fn get_profile(address_string: &str) -> Result<MemberProfile> {
    let signer: PrivateKeySigner = config::PRIVATE_KEY.parse()?;
    // let provider = ProviderBuilder::new()
    //     .wallet(signer)
    //     .connect("http://localhost:8547")
    //     .await
    //     .expect("failed to build provider");

    // let address = Address::from_hex(address_string.as_bytes())
    //     .expect("failed to convert string to hex address");
    //
    let address = address!("0x3f1eae7d46d88f08fc2f8ed27fcb2ab183eb2d0e");

    // GET doesnt need a signer! Need signer for updating which is done below..
    let provider = ProviderBuilder::new()
        .connect("http://localhost:8547")
        .await
        .expect("failed to build provider");

    // 4. Point to your active contract address
    // let contract_address = address!(DEPLOYED_ADDRESS);

    // 5. Initialize the type-safe contract instance
    let contract = ICliqueProfile::new(CONTRACT_ADDRESS, &provider);

    // ==========================================
    // PATH A: EXECUTING A "CALL" (Read State)
    // ==========================================
    // println!("Fetching current username...");

    // `.call()` simulates an eth_call on the node (No gas spent, reads data)
    // let username = contract
    //     .getUsername(address)
    //     .call()
    //     .await
    //     .expect("failed to get current username");
    // println!("Username in Contract: {:?}", username);

    // let bio = contract
    //     .getBio(address)
    //     .call()
    //     .await
    //     .expect("failed to get current bio");
    // println!("Bio in Contract: {:?}", bio);

    // let avatar = contract
    //     .getAvatarUrl(address)
    //     .call()
    //     .await
    //     .expect("failed to get current avatar url");
    // println!("avatar url in Contract: {:?}", avatar);
    //

    let (address, username, bio, avatar) = contract.getProfile(address).call().await?;

    println!("address: {:?}", address);
    println!("username: {:?}", username);
    println!("bio: {:?}", bio);
    println!("avatar: {:?}", avatar);

    let profile = MemberProfile {
        address: address.to_string(),
        name: username,
        avatar: avatar,
        description: bio,
    };
    // let username = contract
    //     .getUsername(address)
    //     .call()
    //     .await
    //     .expect("failed to get username");

    // let bio = contract
    //     .getBio(address)
    //     .call()
    //     .await
    //     .expect("failed to get bio");

    // let avatar = contract
    //     .getAvatarUrl(address)
    //     .call()
    //     .await
    //     .expect("failed to get avatar");

    // println!("address: {:?}", address);
    // println!("username: {:?}", username);
    // println!("bio: {:?}", bio);
    // println!("avatar: {:?}", avatar);

    Ok(profile)
}
