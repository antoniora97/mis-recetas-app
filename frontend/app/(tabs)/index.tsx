import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Link } from 'expo-router'
import { View, TextInput, Image, ScrollView, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
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

    return (
        <ThemedView className='flex-1 px-2 pt-2'>
            <SafeAreaView className='flex-1'>
                <ThemedText type='title' className='text-center'>Todas mis recetas</ThemedText>

                <View className='flex flex-row my-5 px-3 py-3 gap-2 border border-white rounded-full'>
                    <MaterialIcons name='search' size={30} color={'#ffffff'}></MaterialIcons>
                    <TextInput
                        className='flex-1'
                        placeholder='Buscar entre mis recetas...'
                        placeholderTextColor={'#ffffff'}
                    />
                </View>

                <ScrollView className='gap-y-4' showsVerticalScrollIndicator={false}>
                    {recetas.map((r) => (
                        <Link key={r.id} href={`/recipes/${r.id}`} asChild>
                            <Pressable>
                                <ThemedView className="flex-row gap-x-3 rounded-xl mb-5">
                                    <View className="w-20 h-20 flex border rounded-full">
                                        <Image
                                            source={require('@/assets/images/icon.png')}
                                            className='w-full h-full rounded-xl'
                                        />
                                    </View>

                                    <ThemedView className="flex-1 flex-col justify-between">
                                        <ThemedView className='flex flex-row items-center justify-between'>
                                            <ThemedView className='flex flex-row gap-2'>
                                                {
                                                    r.type.map((t) => {
                                                        return (
                                                            <Text key={r.id + t} className="bg-purple-300 px-2 py-1 rounded-full uppercase font-bold text-xs">
                                                                {t}
                                                            </Text>
                                                        )
                                                    })
                                                }
                                            </ThemedView>

                                            <Text className="text-gray-500 text-base">
                                                {r.cookingTime}
                                            </Text>
                                        </ThemedView>

                                        <View className='flex flex-row justify-between items-center'>
                                            <ThemedText type="subtitle" className="text-lg font-bold leading-tight" numberOfLines={2}>
                                                {r.title}
                                            </ThemedText>
                                            <View className='bg-gray-400 rounded-md'>
                                                <MaterialIcons name='navigate-next' color={'white'} size={25}></MaterialIcons>
                                            </View>
                                        </View>
                                    </ThemedView>
                                </ThemedView>
                            </Pressable>
                        </Link>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
        // <SafeAreaView className='flex-1 bg-white'>
        //     <Text className='text-4xl text-center'>Todas mis recetas</Text>
        //     <ThemedText type='title'>Todas mis recetas</ThemedText>
        //     <View className='flex-1 bg-white, justify-center items-center'>
        //         <Text className='text-4xl text-blue-500'>HOLA</Text>
        //     </View>
        // </SafeAreaView>
    )
}
