use serde::{Deserialize, Serialize};
use std::env;

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct DnsDomain {
    pub use_defalt: bool,
    pub default_domain_index: Option<i32>,
    pub custom_domain: Option<String>,
    pub custom_zone_id: Option<String>,
    pub custom_cloudflare_token: Option<String>,
}

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct CloudflareRequest {
    pub url: String,
    pub token: String,
    pub name: String,
    pub ip_address: String,
}

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct CloudflareResponse {
    pub record_id: Option<String>,
    pub error: Option<String>,
}

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct CloudflareRemoveRequest {
    pub url: String,
    pub token: String,
}

pub async fn create_dns_record(
    domain: DnsDomain,
    name: String,
) -> Result<String, Box<dyn std::error::Error>> {
    let ip_address = env::var("IP_ADDRESS").unwrap();
    let token = env::var("CLOUDFLARE_TOKEN").unwrap();
    let zone_id_1 = env::var("ZONE_ID_1").unwrap();
    let zone_id_2 = env::var("ZONE_ID_2").unwrap();
    let defualt_zone_ids = vec![zone_id_1, zone_id_2];

    let zone_id = if domain.use_defalt {
        defualt_zone_ids[domain.default_domain_index.unwrap() as usize].clone()
    } else {
        domain.custom_zone_id.unwrap()
    };

    let url = format!(
        "https://api.cloudflare.com/client/v4/zones/{}/dns_records",
        zone_id
    );

    let payload: CloudflareRequest = CloudflareRequest {
        url: url.clone(),
        token: token.clone(),
        name: name.clone(),
        ip_address: ip_address.clone(),
    };

    Ok(send_host_server_request(payload).await)
}

pub async fn remove_dns_record(domain: DnsDomain, record_id: String) -> bool {
    let token = env::var("CLOUDFLARE_TOKEN").unwrap();
    let zone_id_1 = env::var("ZONE_ID_1").unwrap();
    let zone_id_2 = env::var("ZONE_ID_2").unwrap();
    let defualt_zone_ids = vec![zone_id_1, zone_id_2];

    let zone_id = if domain.use_defalt {
        defualt_zone_ids[domain.default_domain_index.unwrap() as usize].clone()
    } else {
        domain.custom_zone_id.unwrap()
    };

    let url = format!(
        "https://api.cloudflare.com/client/v4/zones/{}/dns_records/{}",
        zone_id, record_id
    );

    let payload: CloudflareRemoveRequest = CloudflareRemoveRequest {
        url: url.clone(),
        token: token.clone(),
    };

    send_host_server_remove_request(payload).await
}

pub async fn send_host_server_request(host_server_request: CloudflareRequest) -> String {
    let url = env::var("HOST_SERVER_HOST").unwrap();
    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&host_server_request)
        .send()
        .await
        .unwrap();

    if res.status().is_success() {
        let body = res.text().await.unwrap();
        let body_json: CloudflareResponse = serde_json::from_str(&body).unwrap();
        body_json.record_id.unwrap_or_else(|| String::default())
    } else {
        String::default()
    }
}

pub async fn send_host_server_remove_request(host_server_request: CloudflareRemoveRequest) -> bool {
    let url = env::var("HOST_SERVER_HOST").unwrap();
    let client = reqwest::Client::new();
    let res = client
        .delete(&url)
        .header("Content-Type", "application/json")
        .json(&host_server_request)
        .send()
        .await
        .unwrap();

    res.status().is_success()
}
