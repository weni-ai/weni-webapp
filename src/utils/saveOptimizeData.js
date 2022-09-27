import axios from 'axios';
import getEnv from '@/utils/env';

export default function ({
  name,
  email,
  optimize_path,
  project_name,
  project_uuid,
}) {
  axios.post(
    'https://flows.weni.ai/api/v2/contacts.json',
    {
      name,
      fields: {
        email,
        optimize_path,
        project_name,
        project_uuid,
      },
    },
    {
      headers: {
        Authorization: getEnv('MP9_AB_MAPPING_TOKEN'),
      },
    },
  );
}
