use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, BorshStorageKey};

pub use crate::agent::*;
mod agent;

pub const VERSION_CODE: &str = "v1.0.0";

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub agents: Vector<Agent>,
    pub owner: AccountId,
}

#[derive(BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
    Agents,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        let this = Self {
            agents: Vector::new(StorageKey::Agents),
            owner: env::signer_account_id(),
        };
        this
    }

    pub fn add_agent(&mut self, name: String, description: String, prompt: String) {
        let agent = Agent::new(
            Some(name),
            Some(description), 
            Some(prompt)
        );
        self.agents.push(&agent);
    }

    pub fn get_agents(&self) -> Vec<JsonAgent> {
        let agents = self.agents.to_vec();
        agents.iter().map(|agent| agent.to_json()).collect()
    }
}