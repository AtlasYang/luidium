use std::{env, fs};

// To modify the nginx configuration file, just execute remove_nginx_conf and generate_nginx_conf functions in a sequence.
pub fn generate_nginx_conf(
    domain_name: &str,
    port: &str,
    conf_block_name: &str,
    default_conf_index: i32,
) {
    let contents = "
# <block_name> start
server {
	server_name <domain_name>;

	location / {
		proxy_pass http://127.0.0.1:<port>;
	}

	listen 443 ssl;
}

server {
	listen 80;
	server_name <domain_name>;

	location / {
		return 301 https://<domain_name>$request_uri;
	}
}
# <block_name> end
";
    let app_domain_1 = env::var("APP_DOMAIN_1").unwrap();
    let app_domain_2 = env::var("APP_DOMAIN_2").unwrap();
    let app_domain_list = vec![app_domain_1, app_domain_2];

    let app_domain = app_domain_list[default_conf_index as usize].clone();

    let full_domain_name = format!("{}.{}", domain_name, app_domain);

    let contents = contents
        .replace("<domain_name>", &full_domain_name)
        .replace("<port>", port)
        .replace("<block_name>", conf_block_name);

    let conf_file_1 = env::var("NGINX_CONF_FILE_1").unwrap();
    let conf_file_2 = env::var("NGINX_CONF_FILE_2").unwrap();
    let conf_file_list = vec![conf_file_1, conf_file_2];

    println!("{:?}", conf_file_list);

    let conf_file = conf_file_list[default_conf_index as usize].clone();
    let original_conf_content = fs::read_to_string(conf_file.clone()).expect("Failed to read file");

    let new_conf_content = format!("{}\n{}", original_conf_content, contents);

    fs::write(conf_file, new_conf_content).expect("Unable to write file");
}

pub fn remove_nginx_conf(conf_block_name: &str, default_conf_index: i32) {
    let conf_file_1 = env::var("NGINX_CONF_FILE_1").unwrap();
    let conf_file_2 = env::var("NGINX_CONF_FILE_2").unwrap();
    let conf_file_list = vec![conf_file_1, conf_file_2];

    let conf_file = conf_file_list[default_conf_index as usize].clone();
    let original_conf_content = fs::read_to_string(conf_file.clone()).expect("Failed to read file");

    let new_conf_content = original_conf_content
        .split("#")
        .filter(|x| !x.contains(conf_block_name))
        .collect::<Vec<&str>>()
        .join("#");

    fs::write(conf_file, new_conf_content).expect("Unable to write file");
}
