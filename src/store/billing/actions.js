import orgs from '../../api/orgs';

export default {
  getOrgInvoices(
    store,
    {
      organizationUuid,
      ordering,
      search,
      start_due_date,
      end_due_date,
      payment_status,
      page = 1,
      limit = 20,
    },
  ) {
    const offset = limit * (page - 1);

    return orgs.getOrgInvoices({
      organizationUuid,
      ordering,
      search,
      start_due_date,
      end_due_date,
      payment_status,
      offset,
      limit,
    });
  },
};
