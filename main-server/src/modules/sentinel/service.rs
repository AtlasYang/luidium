use crate::{
    modules::{
        block::service::read_block,
        model::{SingleBoolResponse, SingleUuidResponse},
    },
    util::BaseHttpClient,
    AppState,
};
use std::env;
use uuid::Uuid;

use super::model::{
    Authority, AuthorityResponse, Log, SentinelBaseResponse, TokenRequest, TokenResponse,
    UsageCapApplication, UsageCapBlock, UsageCapVersion, User, UserLoginRequest,
    UserRegisterRequest, UserResponse, UserUpdateRequest, ValidateTokenResponse,
};

pub fn create_sentinel_client() -> BaseHttpClient {
    BaseHttpClient::new(format!(
        "http://{}",
        env::var("SENTINEL_SERVER_HOST").unwrap()
    ))
}

pub async fn register_user(
    req: UserRegisterRequest,
) -> Result<SingleUuidResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client.post("/auth/register", &req).await?;
    let response: SingleUuidResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn login_user(
    req: UserLoginRequest,
) -> Result<TokenResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client.post("/auth/login", &req).await?;
    let response: TokenResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn logout_user(
    user_id: Uuid,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .post(format!("/auth/logout/{}", user_id).as_str(), &"")
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn validate_token(
    req: TokenRequest,
) -> Result<ValidateTokenResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client.post("/auth/validate", &req).await?;
    let response: ValidateTokenResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn get_user_by_id(user_id: Uuid) -> Result<UserResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/auth/user/{}", user_id).as_str())
        .await?;
    let response: UserResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn get_user_by_email(email: &str) -> Result<Vec<User>, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/auth/search/{}", email).as_str())
        .await?;
    let response: Vec<User> = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn check_email_duplicate(email: &str) -> Result<bool, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/auth/check/{}", email).as_str())
        .await?;
    let response: SingleBoolResponse = serde_json::from_str(&response)?;
    Ok(response.success)
}

pub async fn update_user(
    user_id: Uuid,
    req: UserUpdateRequest,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .put(format!("/auth/user/{}", user_id).as_str(), &req)
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn delete_user(
    user_id: Uuid,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .delete(format!("/auth/user/{}", user_id).as_str())
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn get_usage_cap_application(
    user_id: Uuid,
) -> Result<UsageCapApplication, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/usagecap/application/{}", user_id).as_str())
        .await?;
    let response: UsageCapApplication = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn create_usage_cap_appcliation(
    user_id: Uuid,
    application_number: i32,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = UsageCapApplication {
        user_id,
        remaining: application_number,
    };
    let response = client.post("/usagecap/application", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn update_usage_cap_application(
    user_id: Uuid,
    application_number: i32,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = UsageCapApplication {
        user_id,
        remaining: application_number,
    };
    let response = client.put("/usagecap/application", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn get_usage_cap_version(
    user_id: Uuid,
    application_id: Uuid,
) -> Result<UsageCapVersion, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/usagecap/version/{}/{}", user_id, application_id).as_str())
        .await?;
    let response: UsageCapVersion = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn create_usage_cap_version(
    user_id: Uuid,
    application_id: Uuid,
    amount: i32,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = UsageCapVersion {
        user_id,
        application_id,
        remaining: amount,
    };
    let response = client.post("/usagecap/version", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn update_usage_cap_version(
    user_id: Uuid,
    application_id: Uuid,
    amount: i32,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = UsageCapVersion {
        user_id,
        application_id,
        remaining: amount,
    };
    let response = client.put("/usagecap/version", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn get_usage_cap_block(
    user_id: Uuid,
    application_id: Uuid,
    version: &str,
) -> Result<UsageCapBlock, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/usagecap/block/{}/{}/{}", user_id, application_id, version).as_str())
        .await?;
    let response: UsageCapBlock = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn create_usage_cap_block(
    user_id: Uuid,
    application_id: Uuid,
    version: &str,
    block_number: i32,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = UsageCapBlock {
        user_id,
        application_id,
        version: version.to_string(),
        remaining: block_number,
    };
    let response = client.post("/usagecap/block", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn update_usage_cap_block(
    user_id: Uuid,
    application_id: Uuid,
    version: &str,
    block_number: i32,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = UsageCapBlock {
        user_id,
        application_id,
        version: version.to_string(),
        remaining: block_number,
    };
    let response = client.put("/usagecap/block", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn delete_all_usage_cap(
    user_id: Uuid,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .delete(format!("/usagecap/{}", user_id.to_string()).as_str())
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn create_authority(
    user_id: Uuid,
    entity_id: Uuid,
    class: &str,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = Authority {
        user_id,
        entity_id,
        class: class.to_string(),
    };
    let response = client.post("/authority", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn update_authority(
    user_id: Uuid,
    entity_id: Uuid,
    class: &str,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let payload = Authority {
        user_id,
        entity_id,
        class: class.to_string(),
    };
    let response = client.put("/authority", &payload).await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn delete_authority(
    user_id: Uuid,
    entity_id: Uuid,
) -> Result<SentinelBaseResponse, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .delete(format!("/authority/{}/{}", user_id, entity_id).as_str())
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response)
}

pub async fn get_authority(
    user_id: Uuid,
    entity_id: Uuid,
) -> Result<Authority, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/authority/{}/{}", user_id, entity_id).as_str())
        .await?;
    let response: AuthorityResponse = serde_json::from_str(&response)?;
    if response.error.is_some() {
        return Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::Other,
            response.error.unwrap(),
        )));
    }
    Ok(response.authority.unwrap())
}

pub async fn get_authority_by_entity(
    entity_id: Uuid,
) -> Result<Vec<Authority>, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/authority/entity/{}", entity_id).as_str())
        .await?;
    let response: AuthorityResponse = serde_json::from_str(&response)?;
    if response.error.is_some() {
        return Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::Other,
            response.error.unwrap(),
        )));
    }
    Ok(response.authorities.unwrap_or(vec![]))
}

pub async fn check_authority_readable(
    user_id: Uuid,
    entity_id: Uuid,
) -> Result<bool, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/authority/read/{}/{}", user_id, entity_id).as_str())
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;
    Ok(response.success.unwrap_or(false))
}

pub async fn check_authority_writable(
    app_state: &AppState,
    user_id: Uuid,
    entity_id: Uuid,
) -> Result<bool, Box<dyn std::error::Error>> {
    let client = create_sentinel_client();

    let res = match read_block(&app_state, entity_id).await {
        Some(block) => {
            let response = client
                .get(format!("/authority/write/{}/{}", user_id, block.application_id).as_str())
                .await?;
            let response: SentinelBaseResponse = serde_json::from_str(&response)?;
            response.success.unwrap_or(false)
        }
        None => false,
    };

    let response = client
        .get(format!("/authority/write/{}/{}", user_id, entity_id).as_str())
        .await?;
    let response: SentinelBaseResponse = serde_json::from_str(&response)?;

    Ok(res || response.success.unwrap_or(false))
}

pub async fn read_logs_with_user_id(user_id: Uuid) -> Vec<Log> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/logger/{}", user_id).as_str())
        .await
        .unwrap();

    match serde_json::from_str(&response) {
        Ok(logs) => logs,
        Err(_) => vec![],
    }
}

pub async fn read_logs_with_user_id_and_application_id(
    user_id: Uuid,
    application_id: Uuid,
) -> Vec<Log> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/logger/{}/application/{}", user_id, application_id).as_str())
        .await
        .unwrap();

    match serde_json::from_str(&response) {
        Ok(logs) => logs,
        Err(e) => {
            println!("error parsing log {:?}", e);
            vec![]
        }
    }
}

pub async fn read_logs_with_user_id_and_block_id(user_id: Uuid, block_id: Uuid) -> Vec<Log> {
    let client = create_sentinel_client();
    let response = client
        .get(format!("/logger/{}/block/{}", user_id, block_id).as_str())
        .await
        .unwrap();

    match serde_json::from_str(&response) {
        Ok(logs) => logs,
        Err(_) => vec![],
    }
}
