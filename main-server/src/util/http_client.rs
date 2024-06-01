use reqwest::Client;
use serde::Serialize;

pub struct BaseHttpClient {
    client: Client,
    base_url: String,
}

impl BaseHttpClient {
    pub fn new(base_url: String) -> Self {
        let client = Client::new();
        Self { client, base_url }
    }

    pub async fn get(&self, sub_uri: &str) -> Result<String, Box<dyn std::error::Error>> {
        let url = format!("{}{}", self.base_url, sub_uri);
        let response = self.client.get(&url).send().await?;

        let body = response.text().await?;
        Ok(body)
    }

    pub async fn post<T: Serialize>(
        &self,
        sub_uri: &str,
        payload: &T,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let url = format!("{}{}", self.base_url, sub_uri);
        let response = self.client.post(&url).json(payload).send().await?;

        let body = response.text().await?;
        Ok(body)
    }

    pub async fn put<T: Serialize>(
        &self,
        sub_uri: &str,
        payload: &T,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let url = format!("{}{}", self.base_url, sub_uri);
        let response = self.client.put(&url).json(payload).send().await?;

        let body = response.text().await?;
        Ok(body)
    }

    pub async fn delete(&self, sub_uri: &str) -> Result<String, Box<dyn std::error::Error>> {
        let url = format!("{}{}", self.base_url, sub_uri);
        let response = self.client.delete(&url).send().await?;

        let body = response.text().await?;
        Ok(body)
    }
}
