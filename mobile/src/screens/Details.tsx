import { VStack, useToast, HStack, Text } from "native-base";
import { Share } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useState, useEffect } from 'react';

import { api } from "../services/api";

import { Guesses } from "../components/Guesses";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PoolPros } from '../components/PoolCard';
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { EmptyRakingList } from "../components/EmptyRakingList";
import { Option } from '../components/Option';

interface RouteParams {
    id: string;
}

export function Details() {
    const [optionSelect, setOptionSelect] = useState<'Seus Palpites' | 'Ranking do Grupo'>('Seus Palpites');
    const [isLoading, setIsLoading] = useState(true);
    const [poolsDetails, setPoolsDetails] = useState<PoolPros>({} as PoolPros);

    const route = useRoute();
    const { id } = route.params as RouteParams;
    const toast = useToast();

    async function fetchPoolDetails(){
        try {
            setIsLoading(true);

            const response = await api.get(`/pools/${id}`);
            setPoolsDetails(response.data.pool);
            
        } catch (error) {
            console.log(error)

            toast.show({
                title: 'Não foi possível carregar os detalhes do bolão.',
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false);
        }
    }
    
    async function handlerCodeShare() {
        await Share.share({
            message: poolsDetails.code
        });
    }

    useEffect(() => {
        fetchPoolDetails();
    }, [id]);

    if (isLoading) {
        return (<Loading />)
    }

    return (
        <VStack flex = {1} bgColor = 'gray.900'>
            <Header title = {poolsDetails.title} showBackButton showShareButton onShare={handlerCodeShare} />

            { 
                poolsDetails._count?.participants > 0 ?
                <VStack px = {5} flex = {1}>
                    <PoolHeader data = {poolsDetails} />

                    <HStack bgColor = "gray.800" p = {1} rounded = "sm" mb = {5}>
                        <Option 
                            title = 'Seus Palpites' 
                            isSelected = {optionSelect === 'Seus Palpites'} 
                            onPress = {() => setOptionSelect('Seus Palpites')} 
                        />

                        <Option 
                            title = 'Ranking do Grupo' 
                            isSelected = {optionSelect === 'Ranking do Grupo'} 
                            onPress = {() => setOptionSelect('Ranking do Grupo')} 
                        />
                    </HStack>

                    {
                        optionSelect === 'Seus Palpites' ?
                            <Guesses poolId = {poolsDetails.id} code={poolsDetails.code} />
                        : <EmptyRakingList />
                    }

                </VStack>

                : <EmptyMyPoolList code = {poolsDetails.code} />
            }

        </VStack>
    )
}