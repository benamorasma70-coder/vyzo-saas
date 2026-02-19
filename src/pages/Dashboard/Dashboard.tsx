import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Box,
  Text,
  Heading,
  SimpleGrid,
  Flex,
  Icon,
  Badge,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Users, Package, FileText, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface Stats {
  totalCustomers: number;
  totalProducts: number;
  monthlyInvoices: number;
  monthlyRevenue: number;
  lowStock: Array<{ id: string; name: string; stock_quantity: number }>;
  recentInvoices: Array<{
    id: string;
    invoice_number: string;
    total: number;
    status: string;
    customer_name: string;
  }>;
  trends: {
    customers: number;
    products: number;
    invoices: number;
    revenue: number;
  };
}

export function Dashboard() {
  const { user, subscription } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (!stats) {
    return (
      <Flex justify="center" py={10}>
        <Text>Chargement...</Text>
      </Flex>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      {/* En-tête */}
      <Box mb={8}>
        <Heading size="lg" color="gray.900">
          Bonjour, {user?.companyName}
        </Heading>
        <Text color={textColor} mt={1}>
          Plan actuel :{' '}
          <Box as="span" fontWeight="medium" color="blue.600">
            {subscription?.display_name || 'Gratuit'}
          </Box>
          {subscription && (
            <Box as="span" ml={2} fontSize="xs" color="gray.400">
              (expire le {new Date(subscription.expires_at).toLocaleDateString()})
            </Box>
          )}
          {subscription?.expires_soon && (
            <Box as="span" ml={2} fontSize="sm" color="yellow.600">
              (Expire dans {subscription.days_remaining} jours)
            </Box>
          )}
        </Text>
      </Box>

      {/* Cartes de statistiques */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Clients"
          value={stats.totalCustomers}
          icon={Users}
          trend={stats.trends.customers}
          color="blue"
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts}
          icon={Package}
          trend={stats.trends.products}
          color="green"
        />
        <StatCard
          title="Factures (ce mois)"
          value={stats.monthlyInvoices}
          icon={FileText}
          trend={stats.trends.invoices}
          color="purple"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.monthlyRevenue.toLocaleString()} TND`}
          icon={DollarSign}
          trend={stats.trends.revenue}
          color="orange"
        />
      </SimpleGrid>

      {/* Alertes stock et dernières factures */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Alertes stock */}
        <Box bg={bgCard} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
          <Heading size="md" mb={4}>
            Alertes Stock
          </Heading>
          {stats.lowStock.length === 0 ? (
            <Text color="gray.500">Aucune alerte</Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {stats.lowStock.map((product) => (
                <Flex
                  key={product.id}
                  align="center"
                  justify="space-between"
                  p={3}
                  bg="red.50"
                  borderRadius="lg"
                >
                  <Flex align="center">
                    <Icon as={AlertCircle} color="red.500" boxSize={5} mr={3} />
                    <Text fontWeight="medium" color="gray.700">
                      {product.name}
                    </Text>
                  </Flex>
                  <Text fontWeight="bold" color="red.600">
                    {product.stock_quantity} restant
                  </Text>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>

        {/* Dernières factures */}
        <Box bg={bgCard} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={6}>
          <Heading size="md" mb={4}>
            Dernières Factures
          </Heading>
          <VStack spacing={3} align="stretch">
            {stats.recentInvoices.map((invoice) => (
              <Flex
                key={invoice.id}
                align="center"
                justify="space-between"
                p={3}
                borderWidth="1px"
                borderColor="gray.100"
                borderRadius="lg"
                _hover={{ bg: 'gray.50' }}
                transition="background 0.2s"
              >
                <Box>
                  <Text fontWeight="medium" color="gray.800">
                    {invoice.invoice_number}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {invoice.customer_name}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontWeight="bold" color="gray.900">
                    {invoice.total.toLocaleString()} TND
                  </Text>
                  <Badge
                    colorScheme={
                      invoice.status === 'paid'
                        ? 'green'
                        : invoice.status === 'overdue'
                        ? 'red'
                        : 'yellow'
                    }
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {invoice.status === 'paid'
                      ? 'Payée'
                      : invoice.status === 'overdue'
                      ? 'En retard'
                      : 'En attente'}
                  </Badge>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

// Composant de carte avec tendance dynamique
function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: { bg: 'blue.50', icon: 'blue.600' },
    green: { bg: 'green.50', icon: 'green.600' },
    purple: { bg: 'purple.50', icon: 'purple.600' },
    orange: { bg: 'orange.50', icon: 'orange.600' },
  };

  const trendColor = trend >= 0 ? 'green.600' : 'red.600';
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <Box
      bg="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.100"
      p={6}
      _hover={{ shadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      <Flex align="center" justify="space-between">
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.900" mt={1}>
            {value}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          boxSize={12}
          bg={colors[color].bg}
          borderRadius="lg"
        >
          <Icon as={icon} color={colors[color].icon} boxSize={6} />
        </Flex>
      </Flex>
      <Flex align="center" mt={4} fontSize="sm">
        <Icon as={TrendIcon} color={trendColor} boxSize={4} mr={1} />
        <Text fontWeight="medium" color={trendColor}>
          {trend > 0 ? '+' : ''}
          {trend}%
        </Text>
        <Text color="gray.500" ml={2}>
          vs mois dernier
        </Text>
      </Flex>
    </Box>
  );
}
