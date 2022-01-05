import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import i18n from '@/utils/plugins/i18n';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import weniLogo from '!!svg-inline-loader!@/assets/brand-name.svg';

export default {
  fillValues({
    clientName,
    clientAddress,
    invoiceId,
    billingDate,
    invoiceDate,
    organizationPlan,
    totalPurchasePrice,
    iva,
    totalOrder,
    payment,
    balance,
    currency,
    projects,
  }) {
    return pdfMake.createPdf({
      footer: {
        columns: [
          {
            text: i18n.t('billing.active_contacts.doc.obs'),
            margin: [21, 0],
          },
        ],
      },
      content: [
        {
          svg: weniLogo,
          width: 126,
        },
        {
          columns: [
            [
              {
                text: 'WENI TECNOLOGIA DA INFORMAÇÃO LTDA\n16.755.375/0001-00',
                bold: true,
              },
              {
                text: 'Rua Melo Póvoa, 106 Jaraguá - Sala 312\nMACEIÓ-AL\nCEP 57022-230',
                color: '#56788B',
              },
              {
                text: i18n.t('billing.active_contacts.doc.billing_address'),
                bold: true,
              },
              {
                text: `${clientName}\n${clientAddress}`,
                color: '#56788B',
              },
            ],
            {
              width: 'auto',
              table: {
                headerRows: 1,
                widths: ['*', 'auto'],
                body: [
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.invoice_id'),
                      bold: true,
                    },
                    invoiceId,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.billing_date'),
                      bold: true,
                    },
                    billingDate,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.invoice_date'),
                      bold: true,
                    },
                    invoiceDate,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.plan'),
                      bold: true,
                    },
                    organizationPlan,
                  ],
                ],
              },
              layout: {
                hLineWidth: function (i, node) {
                  return i === 0 || i === node.table.body.length ? 1 : 0;
                },
                vLineWidth: function (i, node) {
                  return i === 0 || i === node.table.widths.length ? 1 : 0;
                },
                hLineColor: function (i, node) {
                  return i === 0 || i === node.table.body.length
                    ? '#E2E6ED'
                    : null;
                },
                vLineColor: function (i, node) {
                  return i === 0 || i === node.table.widths.length
                    ? '#E2E6ED'
                    : null;
                },
              },
            },
          ],
        },

        {
          text: i18n.t('billing.active_contacts.doc.payment_method'),
          bold: true,
        },
        {
          text: i18n.t('billing.active_contacts.doc.credit_card'),
          color: '#56788B',
        },
        {
          margin: [0, 10],
          color: '#3B414D',
          table: {
            headerRows: 1,
            widths: ['*', '*', 120],
            body: [
              [
                {
                  text: i18n.t('billing.active_contacts.doc.project'),
                  color: '#67738B',
                },
                {
                  text: i18n.t(
                    'billing.active_contacts.doc.active_contacts_number',
                  ),
                  color: '#67738B',
                },
              ],
              ...projects,
            ],
          },
          layout: {
            fillColor: function (i) {
              return i === 0 ? '#F9F9F9' : null;
            },
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 1 : 0;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 1 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#E2E6ED' : null;
            },
            vLineColor: function (i, node) {
              return i === 0 || i === node.table.widths.length
                ? '#E2E6ED'
                : null;
            },
          },
        },
        {
          columns: [
            {},
            {
              width: 'auto',
              table: {
                headerRows: 1,
                widths: ['*', 'auto'],
                body: [
                  [
                    {
                      text: i18n.t(
                        'billing.active_contacts.doc.total_purchase_price',
                      ),
                      bold: true,
                    },
                    totalPurchasePrice,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.iva'),
                      bold: true,
                    },
                    iva,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.total_order'),
                      bold: true,
                    },
                    totalOrder,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.payment'),
                      bold: true,
                    },
                    payment,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.balance'),
                      bold: true,
                    },
                    balance,
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.currency'),
                      bold: true,
                    },
                    currency,
                  ],
                ],
              },
              layout: {
                hLineWidth: function (i) {
                  return i === 4 ? 1 : 0;
                },
                vLineWidth: function () {
                  return 0;
                },
                hLineColor: function () {
                  return '#E2E6ED';
                },
              },
            },
          ],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 50, 0, 10],
          border: 40,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
      },
      defaultStyle: {
        color: '#3B3B3B',
        fontSize: 10,
      },
      pageSize: 'A4',
      pageMargins: [21, 36, 21, 36],
    });
  },
};
