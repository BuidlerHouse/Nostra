use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Agent {
    pub name: String,
    pub description: String,
    pub prompt: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct JsonAgent {
    pub name: String,
    pub description: String,
    pub prompt: String,
}

impl Agent {
    pub fn new(
        name: Option<String>,
        description: Option<String>,
        prompt: Option<String>,
    ) -> Self {
        Agent {
            name: name.unwrap_or("".to_string()),
            description: description.unwrap_or("".to_string()),
            prompt: prompt.unwrap_or("".to_string()),
        }
    }

    pub fn to_json(&self) -> JsonAgent {
        JsonAgent {
            name: self.name.clone(),
            description: self.description.clone(),
            prompt: self.prompt.clone(),
        }
    }
}
