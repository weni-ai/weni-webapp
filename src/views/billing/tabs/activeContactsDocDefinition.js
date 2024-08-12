import i18n from '@/utils/plugins/i18n';
import pdfMake from 'pdfmake/build/pdfmake';

pdfMake.fonts = {
  Roboto: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
};

import weniLogo from '@/assets/brand-name.svg?raw';

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
          marginBottom: 12,
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
                width: 'auto',
                margin: [0, 8, 0, 8],
                lineHeight: 0,
                table: {
                  headerRows: 1,
                  widths: [218],
                  body: [[{ text: '', lineHeight: 0 }]],
                },
                layout: {
                  hLineWidth: function (i) {
                    return i === 0 ? 1 : 0;
                  },
                  vLineWidth: function () {
                    return 0;
                  },
                  hLineColor: function () {
                    return '#E2E6ED';
                  },
                },
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
                widths: [108, 80],
                body: [
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.invoice_id'),
                      bold: true,
                      marginBottom: 20,
                    },
                    {
                      alignment: 'right',
                      text: invoiceId,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.billing_date'),
                      bold: true,
                      marginBottom: 20,
                    },
                    {
                      alignment: 'right',
                      text: billingDate,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.invoice_date'),
                      bold: true,
                      marginBottom: 20,
                    },
                    {
                      alignment: 'right',
                      text: invoiceDate,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.plan'),
                      bold: true,
                      margin: [0, 0, 0, 16],
                      lineHeight: 1,
                    },
                    {
                      alignment: 'right',
                      text: organizationPlan,
                    },
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
                paddingLeft: function (i) {
                  return i === 0 ? 16 : 0;
                },
                paddingRight: function (i, node) {
                  return i === node.table.widths.length - 1 ? 31 : 0;
                },
                paddingTop: function (i) {
                  return i === 0 ? 16 : 0;
                },
              },
            },
          ],
        },

        {
          width: 'auto',
          margin: [0, 26.5, 0, 12.5],
          lineHeight: 0,
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [[{ text: '', lineHeight: 0 }]],
          },
          layout: {
            hLineWidth: function (i) {
              return i === 0 ? 2 : 0;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function () {
              return '#4E5666';
            },
          },
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
            widths: ['*', '*'],
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
                widths: [95, 93],
                body: [
                  [
                    {
                      text: i18n.t(
                        'billing.active_contacts.doc.total_purchase_price',
                      ),
                      bold: true,
                      marginBottom: 13,
                    },
                    {
                      alignment: 'right',
                      text: totalPurchasePrice,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.iva'),
                      bold: true,
                      marginBottom: 13,
                    },
                    {
                      alignment: 'right',
                      text: iva,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.total_order'),
                      bold: true,
                      marginBottom: 13,
                    },
                    {
                      alignment: 'right',
                      text: totalOrder,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.payment'),
                      bold: true,
                      marginBottom: 13 / 2,
                    },
                    {
                      alignment: 'right',
                      text: payment,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.balance'),
                      bold: true,
                      marginTop: 13 / 2,
                      marginBottom: 13,
                    },
                    {
                      alignment: 'right',
                      text: balance,
                    },
                  ],
                  [
                    {
                      text: i18n.t('billing.active_contacts.doc.currency'),
                      bold: true,
                      marginBottom: 13,
                    },
                    {
                      alignment: 'right',
                      text: currency,
                    },
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
        fontSize: 8,
        lineHeight: 1.47,
      },
      pageSize: 'A4',
      pageMargins: [21, 36, 21, 36],
    });
  },
};
