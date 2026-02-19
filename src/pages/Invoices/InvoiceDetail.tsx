import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Divider,
  useToast,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { ArrowLeft, Download } from 'lucide-react';
import { Icon } from '@chakra-ui/react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total: number;
  paid_amount: number;
  status: string;
  customer_name: string;
  notes?: string;
  items: InvoiceItem[];
}

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement de la facture',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!invoice) return;
    setUpdating(true);
    try {
      let data: any = { status: newStatus };
      if (newStatus === 'partial') {
        const amount = prompt('Montant payé (TND) ?', invoice.paid_amount?.toString() || '0');
        if (amount === null) {
          setUpdating(false);
          return;
        }
        const paid = parseFloat(amount);
        if (isNaN(paid) || paid < 0 || paid > invoice.total) {
          alert('Montant invalide');
          setUpdating(false);
          return;
        }
        data.paid_amount = paid;
      } else if (newStatus === 'paid') {
        data.paid_amount = invoice.total;
      }
      await api.patch(`/invoices/${id}/status`, data);
      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchInvoice(); // recharger les données à jour
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du changement de statut',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoice?.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du téléchargement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!invoice) {
    return (
      <Flex justify="center" py={10}>
        <Text>Facture non trouvée</Text>
      </Flex>
    );
  }

  return (
    <Container maxW="4xl" py={6}>
      <IconButton
        icon={<Icon as={ArrowLeft} />}
        aria-label="Retour"
        variant="ghost"
        onClick={() => navigate('/invoices')}
        mb={6}
      />

      <Box bg="white" borderRadius="lg" shadow="base" p={6}>
        {/* En-tête */}
        <Flex justify="space-between" align="flex-start" mb={6} wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg">Facture {invoice.invoice_number}</Heading>
            <Text color="gray.500">Créée le {invoice.issue_date}</Text>
          </Box>
          <HStack spacing={2} wrap="wrap">
            <Button
              leftIcon={<Icon as={Download} />}
              onClick={handleDownloadPdf}
              variant="outline"
            >
              PDF
            </Button>
            <Select
              value={invoice.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              width="auto"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
              <option value="partial">Partiellement payée</option>
            </Select>
          </HStack>
        </Flex>

        <Divider />

        {/* Client */}
        <Box py={4}>
          <Text fontWeight="semibold" mb={2}>
            Client
          </Text>
          <Text>{invoice.customer_name}</Text>
        </Box>

        <Divider />

        {/* Articles */}
        <Box py={4}>
          <Text fontWeight="semibold" mb={4}>
            Articles
          </Text>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Description</Th>
                  <Th isNumeric>Qté</Th>
                  <Th isNumeric>P.U HT</Th>
                  <Th isNumeric>TVA %</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoice.items.map((item) => {
                  const total = item.quantity * item.unit_price * (1 + item.tax_rate / 100);
                  return (
                    <Tr key={item.id}>
                      <Td>{item.description}</Td>
                      <Td isNumeric>{item.quantity}</Td>
                      <Td isNumeric>{item.unit_price.toFixed(2)} TND</Td>
                      <Td isNumeric>{item.tax_rate}%</Td>
                      <Td isNumeric>{total.toFixed(2)} TND</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Divider />

        {/* Totaux */}
        <Flex justify="flex-end" py={4}>
          <Box w={{ base: 'full', sm: '72' }}>
            <Flex justify="space-between" fontWeight="bold">
              <Text>Total TTC :</Text>
              <Text>{invoice.total.toFixed(2)} TND</Text>
            </Flex>
            {invoice.paid_amount > 0 && (
              <Flex justify="space-between" fontSize="sm" color="green.600" mt={1}>
                <Text>Payé :</Text>
                <Text>{invoice.paid_amount.toFixed(2)} TND</Text>
              </Flex>
            )}
          </Box>
        </Flex>

        {invoice.notes && (
          <>
            <Divider />
            <Box py={4}>
              <Text fontWeight="semibold" mb={2}>
                Notes
              </Text>
              <Text color="gray.700">{invoice.notes}</Text>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
