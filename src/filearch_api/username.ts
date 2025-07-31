export async function IsUsernameAvailable(nameToCheck: String): Promise<Boolean> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_FILEARCH_API_URL + "/username/available?username=" + nameToCheck,
            {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
        
        if (response.status != 200) {
            console.error('Error while validating username is available. status=', response.status)
            return false;
        }

        const data = await response.json();
        return data.action_responses[0].data;
    } catch (error) {
        console.error('Error :', error);
        return false;
    }
}