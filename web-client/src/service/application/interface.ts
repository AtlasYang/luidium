export interface Application {
  id: string;
  active_version: string;
  app_displayname: string;
  app_id: string;
  app_name: string;
  created_at: string;
  description: string;
  image_url: string;
  is_active: boolean;
  user_id: string;
  version_list: string[];
}

export function getApplicationForCreate({
  app_displayname,
  app_id,
  app_name,
  description,
  image_url,
}: {
  app_displayname: string;
  app_id: string;
  app_name: string;
  description: string;
  image_url: string;
}): Application {
  const defaultUuid = "00000000-0000-0000-0000-000000000000";
  return {
    id: defaultUuid,
    active_version: "1.0.0",
    app_displayname,
    app_id,
    app_name,
    created_at: new Date().toISOString(),
    description,
    image_url,
    is_active: false,
    user_id: defaultUuid,
    version_list: ["1.0.0"],
  };
}
