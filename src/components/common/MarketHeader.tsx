import React, { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { getIndexData, IndexData } from '../../services/realtimeDataService';
import { formatNumber, formatPercentage } from '../../utils/formatters';

export const MarketHeader: React.FC = () => {
  const [indexData, setIndexData] = useState<IndexData>({ nifty: null, sensex: null });

  useEffect(() => {
    const fetchIndexData = async () => {
      const data = await getIndexData();
      setIndexData(data);
    };

    fetchIndexData();
    const interval = setInterval(fetchIndexData, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    }
    return value.toString();
  };

  return (
    <Box 
      bg="neutral.900" 
      color="white" 
      py={2} 
      overflow="hidden" 
      borderBottom="1px solid" 
      borderColor="neutral.200"
    >
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .marquee-content {
            animation: marquee 45s linear infinite;
            display: flex;
            white-space: nowrap;
          }
        `}
      </style>
      <Box className="marquee-content">
        <Flex align="center" gap={8} px={4}>
          {indexData.nifty && (
            <Flex align="center" gap={3}>
              <Text fontWeight="bold">NIFTY 50</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.300">
                {formatValue(indexData.nifty.ltp)}
              </Text>
              <Text 
                fontSize="sm" 
                fontWeight="medium"
                color={indexData.nifty.change >= 0 ? "green.300" : "red.300"}
              >
                {indexData.nifty.change >= 0 ? '+' : ''}{formatNumber(indexData.nifty.change)} ({formatPercentage(indexData.nifty.changePercent)})
              </Text>
            </Flex>
          )}
          
          {indexData.sensex && (
            <Flex align="center" gap={3}>
              <Text fontWeight="bold">SENSEX</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.300">
                {formatValue(indexData.sensex.ltp)}
              </Text>
              <Text 
                fontSize="sm" 
                fontWeight="medium"
                color={indexData.sensex.change >= 0 ? "green.300" : "red.300"}
              >
                {indexData.sensex.change >= 0 ? '+' : ''}{formatNumber(indexData.sensex.change)} ({formatPercentage(indexData.sensex.changePercent)})
              </Text>
            </Flex>
          )}
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">BANK NIFTY</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              52.35K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.300">
              +412.6 (+0.80%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY IT</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              43.21K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.300">
              +287.4 (+0.67%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY PHARMA</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              22.18K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="red.300">
              -89.2 (-0.40%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY AUTO</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              25.67K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.300">
              +156.8 (+0.62%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY FMCG</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              56.43K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.300">
              +234.5 (+0.42%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY METAL</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              9.87K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="red.300">
              -67.3 (-0.68%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY ENERGY</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              35.92K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.300">
              +198.7 (+0.56%)
            </Text>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text fontWeight="bold">NIFTY REALTY</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              1.12K
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.300">
              +12.4 (+1.12%)
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};