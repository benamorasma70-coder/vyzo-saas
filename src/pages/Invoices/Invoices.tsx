import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Spinner,
  Text,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Search, Plus, Eye, Download, FileText, RefreshCw } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total: number;
  paid_amount: number;
  status: string;
  customer_name: string;
  has_pdf: number;
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async (id: string) => {
    setGeneratingPdf(id);
    try {
      const response = await api.post(`/invoices/${id}/generate-pdf`);
      window.open(response.data.pdf_url, '_blank');
      fetchInvoices();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la génération du PDF',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du téléchargement',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/invoices/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'factures.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'export",
        status: 'error',
        duration: 5000,
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'overdue':
        return 'red';
      case 'partial':
        return 'yellow';
      case 'sent':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'overdue':
        return 'En retard';
      case 'partial':
        return 'Partiel';
      case 'sent':
        return 'Envoyée';
      default:
        return 'Brouillon';
    }
  };

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="7xl" py={6}>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'start', sm: 'center' }} gap={4} mb={6}>
        <InputGroup maxW={{ base: 'full', sm: '400px' }}>
          <InputLeftElement>
            <Search size={16} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack spacing={2} w={{ base: 'full', sm: 'auto' }}>
          <Button leftIcon={<Download size={16} />} colorScheme="green" onClick={handleExport} isLoading={exporting}>
            Exporter CSV
          </Button>
          <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={() => navigate('/invoices/new')}>
            Nouvelle Facture
          </Button>
        </HStack>
      </Flex>

      {filteredInvoices.length === 0 ? (
        <Box bg="white" p={8} textAlign="center" borderRadius="lg" borderWidth="1px" borderColor="gray.100">
          <Text color="gray.500">Aucune facture trouvée</Text>
        </Box>
      ) : (
        <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" overflow="hidden" overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="gray.50">
              <Tr>
                <Th>N° Facture</Th>
                <Th>Client</Th>
                <Th>Émission</Th>
                <Th isNumeric>Total</Th>
                <Th textAlign="center">Statut</Th>
                <Th textAlign="center">PDF</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInvoices.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td fontFamily="mono" fontSize="sm" color="gray.600">
                    {invoice.invoice_number}
                  </Td>
                  <Td fontWeight="medium">{invoice.customer_name}</Td>
                  <Td fontSize="sm" color="gray.500">
                    {invoice.issue_date}
                  </Td>
                  <Td isNumeric>
                    <Text fontWeight="medium">{invoice.total.toLocaleString()} TND</Text>
                    {invoice.paid_amount > 0 && (
                      <Text fontSize="xs" color="green.600">
                        Payé: {invoice.paid_amount.toLocaleString()} TND
                      </Text>
                    )}
                  </Td>
                  <Td textAlign="center">
                    <Badge colorScheme={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                  </Td>
                  <Td textAlign="center">
                    {invoice.has_pdf ? (
                      <FileText size={20} color="green" />
                    ) : (
                      <FileText size={20} color="gray.300" />
                    )}
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      aria-label="Voir"
                      icon={<Eye size={16} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      mr={2}
                    />
                    {invoice.has_pdf ? (
                      <IconButton
                        aria-label="Télécharger PDF"
                        icon={<Download size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="green"
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                        mr={2}
                      />
                    ) : (
                      <IconButton
                        aria-label="Générer PDF"
                        icon={generatingPdf === invoice.id ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="orange"
                        onClick={() => handleGeneratePdf(invoice.id)}
                        disabled={generatingPdf === invoice.id}
                      />
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
}
