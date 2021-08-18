import _ from 'lodash';
import moment from 'moment-timezone';
import countries from '../../assets/countries';

export default {
  computed: {
    timezones() {
      const timezones = moment.tz.names();

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
