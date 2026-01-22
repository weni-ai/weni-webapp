import _ from 'lodash';
import countries from '../../assets/countries';
import { getMomentTz } from '@/utils/lazyMomentTz';

export default {
  data() {
    return {
      timezoneNames: [],
    };
  },
  async created() {
    const moment = await getMomentTz();
    this.timezoneNames = moment.tz.names();
  },
  computed: {
    timezones() {
      const timezones = this.timezoneNames || [];

      return _.sortBy(
        _.uniqBy(
          countries
            .map((country) => [
              ...country.timezones.map((timezone) => ({
                ...timezone,
                country: country.native,
              })),
            ])
            .flat()
            .filter((timezone) => timezones.includes(timezone.zoneName)),
          'zoneName',
        ),
        ['gmtOffset', 'country', 'zoneName'],
      ).map((timezone) => ({
        ...timezone,
        toString() {
          return `(${timezone.gmtOffsetName.replace('UTC', 'UTC ')}) ${
            timezone.country
          }/${timezone.zoneName}`
            .replace(/\//g, ' / ')
            .replace(/_/g, ' ');
        },
      }));
    },
  },
};
