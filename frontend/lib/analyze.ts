// lib/analyze.ts
export async function analyzeListing(description: string) {
     const response = await fetch('/api/analyze', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ description }),
     });
   
     if (!response.ok) {
       throw new Error('Failed to analyze listing');
     }
   
     return response.json(); // returns { strengths, weaknesses, follow_ups }
   }