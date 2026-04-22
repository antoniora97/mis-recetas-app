import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { Stack, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function RecipeDetail() {
    const recetas = [
        {
            id: 1,
            title: 'Bizcocho fácil',
            cookingTime: '10 minutos',
            type: ['Cena', 'Almuerzo']
        },
        {
            id: 2,
            title: 'Bizcocho fácil ',
            cookingTime: '10 minutos',
            type: ['Cena', 'Almuerzo']
        },
        {
            id: 3,
            title: 'Bizcocho fácil ',
            cookingTime: '10 minutos',
            type: ['Cena', 'Merienda']
        },
        {
            id: 4,
            title: 'Bizcocho fácil ',
            cookingTime: '10 minutos',
            type: ['Cena', 'Almuerzo']
        },
        {
            id: 5,
            title: 'Bizcocho fácil ',
            cookingTime: '10 minutos',
            type: ['Cena', 'Desayuno']
        },
        {
            id: 6,
            title: 'Bizcocho fácil ',
            cookingTime: '10 minutos',
            type: ['Cena', 'Almuerzo']
        },
    ]

    const ingredients = [
        {
            name: 'Pan',
            image: require('@/assets/images/bread.png')
        },
        {
            name: 'Huevo',
            image: require('@/assets/images/egg.png')
        },
        {
            name: 'Soja',
            image: require('@/assets/images/soy.png')
        },
        {
            name: 'Frutas',
            image: require('@/assets/images/fruits.png')
        },
        {
            name: 'Frutas',
            image: require('@/assets/images/fruits.png')
        },
    ]

    const pasos = [
        'Pon a hervir una olla grande con agua con sal. Añade la pasta cocida y cocina hasta que esté al dente según las instrucciones del paquete.',
        'Pon a hervir una olla grande con agua con sal. Añade la pasta cocida y cocina hasta que esté al dente según las instrucciones del paquete.',
        'Pon a hervir una olla grande con agua con sal. Añade la pasta cocida y cocina hasta que esté al dente según las instrucciones del paquete.',
        'Pon a hervir una olla grande con agua con sal. Añade la pasta cocida y cocina hasta que esté al dente según las instrucciones del paquete.'
    ]

    const { id } = useLocalSearchParams<{ id: string }>();

    const recipe = recetas.find((e) => e.id.toString() === id);

    return (
        <ThemedView className='flex flex-1'>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView>
                <View className='h-[350px]'>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        className='w-full h-full'
                    />
                </View>

                <ThemedView className='px-4 py-5'>
                    <ThemedText type='title' className='mb-5'>{recipe?.title}</ThemedText>

                    <ThemedView className='mb-5 flex flex-row justify-between'>
                        <ThemedView className='flex items-center'>
                            <ThemedText type='subtitle'>63 Kcal</ThemedText>
                            <ThemedText>Calorías</ThemedText>
                        </ThemedView>

                        <ThemedView className='flex items-center'>
                            <ThemedText type='subtitle'>11.2 g</ThemedText>
                            <ThemedText>Carbos</ThemedText>
                        </ThemedView>

                        <ThemedView className='flex items-center'>
                            <ThemedText type='subtitle'>1.4 g</ThemedText>
                            <ThemedText>Proteínas</ThemedText>
                        </ThemedView>

                        <ThemedView className='flex items-center'>
                            <ThemedText type='subtitle'>0.3 g</ThemedText>
                            <ThemedText>Grasas</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView className='mb-5 py-5 flex-row flex-wrap rounded-lg gap-y-5' style={{ backgroundColor: '#393E46' }}>
                        {
                            ingredients.map((item, index) => (
                                <View
                                    key={index}
                                    className='w-1/4'
                                >
                                    <View className='rounded-lg items-center justify-center gap-3'>
                                        <Image
                                            source={item.image}
                                            className='w-14 h-14'
                                        />

                                        <ThemedText className='text-center'>{item.name}</ThemedText>
                                    </View>
                                </View>
                            ))
                        }
                    </ThemedView>

                    <ThemedView className='flex gap-y-3'>
                        {
                            pasos.map((p, index) => (
                                <ThemedView className='rounded-lg p-5' key={index} style={{ backgroundColor: '#393E46' }}>
                                    <Text className='text-[#2E7D32] text-6xl/none italic'>{index + 1}</Text>
                                    <Text className='text-white text-3xl/normal'>{p}</Text>
                                </ThemedView>
                            ))
                        }
                    </ThemedView>
                </ThemedView>


            </ScrollView>
        </ThemedView>
    )
}