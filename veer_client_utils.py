from typing import Dict, Optional, List, Union
from pydantic import BaseModel, Field
from azure.ai.inference.models._models import JsonSchemaFormat
import json
from gai_utils import gai_client

# Initialize the client
gai = gai_client()

class OutwardProfile(BaseModel):
    """Schema for public-facing information in a user profile"""
    name: str = Field(description="User's name")
    background: Dict[str, str] = Field(
        description="User's background information",
        default_factory=lambda: {
            "origin": "",
            "current_location": "",
            "time_in_current_location": "",
            "profession": ""
        }
    )
    goals: List[Dict[str, str]] = Field(
        description="User's primary and secondary goals",
        default_factory=list
    )
    motivations: List[str] = Field(
        description="What motivates the user to achieve their goals",
        default_factory=list
    )
    challenges: List[str] = Field(
        description="Challenges the user is facing",
        default_factory=list
    )
    connection_needs: List[str] = Field(
        description="Types of connections the user is seeking",
        default_factory=list
    )
    skills: List[str] = Field(
        description="User's skills and expertise",
        default_factory=list
    )

class PersonalityTraits(BaseModel):
    """Big Five personality traits assessment"""
    openness: str = Field(description="Assessment of openness to experience with evidence")
    conscientiousness: str = Field(description="Assessment of conscientiousness with evidence")
    extraversion: str = Field(description="Assessment of extraversion with evidence")
    agreeableness: str = Field(description="Assessment of agreeableness with evidence")
    neuroticism: str = Field(description="Assessment of neuroticism with evidence")

class CommunicationStyle(BaseModel):
    """Assessment of communication style"""
    clarity: str = Field(description="Assessment of clarity in communication with evidence")
    authenticity: str = Field(description="Assessment of authenticity in communication with evidence")
    detail_orientation: str = Field(description="Assessment of detail orientation in communication with evidence")

class PsychologicalInsights(BaseModel):
    """Deeper psychological insights"""
    identity_connection: str = Field(description="Insight into identity connections based on transcript")
    motivational_drivers: str = Field(description="Insight into motivational drivers based on transcript")
    growth_mindset: str = Field(description="Assessment of growth mindset with evidence")

class BelievabilityAssessment(BaseModel):
    """Assessment of believability in the user's statements"""
    consistency: str = Field(description="Assessment of consistency in the narrative with evidence")
    specificity: str = Field(description="Assessment of specificity in details with evidence")
    emotional_congruence: str = Field(description="Assessment of emotional congruence with evidence")

class MatchingRecommendations(BaseModel):
    """Recommendations for matching"""
    mentor_types: List[str] = Field(description="Types of mentors that would be helpful", default_factory=list)
    peer_types: List[str] = Field(description="Types of peers that would be helpful", default_factory=list)

class InwardProfile(BaseModel):
    """Schema for internal psychological profile"""
    personality_traits: PersonalityTraits
    communication_style: CommunicationStyle
    psychological_insights: PsychologicalInsights
    believability_assessment: BelievabilityAssessment
    potential_concerns: Dict[str, str] = Field(
        description="Potential concerns or growth areas",
        default_factory=dict
    )
    matching_recommendations: MatchingRecommendations

class UserProfile(BaseModel):
    """Complete user profile schema"""
    outward_profile: OutwardProfile
    inward_profile: InwardProfile

# Create JsonSchemaFormat object for the client
user_profile_schema = JsonSchemaFormat(
    schema=UserProfile.model_json_schema(),
    name="UserProfile"
)

# LLM prompt for profile analysis with example output
# LLM prompt for profile analysis with proper name handling
profile_analysis_prompt = """
You are an expert psychological profiler and goal analyst for Veer, a goal manifestation and 
matchmaking platform serving Nepali communities both in Nepal and the diaspora. Analyze the provided 
transcript of a user speaking about themselves to create a comprehensive dual-layer profile.

IMPORTANT: The user's name is provided at the beginning of the transcript in the format "My name is [Name]". 
Always extract and use this exact name in the outward profile. Do not make assumptions about the name.

Remember to pay attention to cultural factors that may be relevant to Nepali culture or the diaspora
experience. Base your psychological assessments on linguistic markers, expressed values, and behavioral
patterns evident in the transcript.

Never leave any field blank or with default values like "Not specified" or "Unknown" unless the information 
is genuinely absent from the transcript. Make your best effort to extract all information present.

Analyze the transcript carefully and extract:

1. OUTWARD PROFILE (public information):
   - Factual information (name, background, location, profession)
   - Goals and aspirations (primary and secondary)
   - Motivations and driving factors
   - Challenges and obstacles
   - Connection needs
   - Skills and experiences

2. INWARD PROFILE (for internal matching only):
   - Big Five personality traits with evidence
   - Communication style assessment
   - Psychological insights
   - Believability assessment
   - Potential concerns or growth areas
   - Specific matching recommendations

Format your response according to the JSON schema provided, with detailed assessments for each
category that include evidence from the transcript.

EXAMPLE OUTPUT:
{
  "outward_profile": {
    "name": "[User's name from transcript]",
    "background": {
      "origin": "[Place of origin mentioned in transcript]",
      "current_location": "[Current location mentioned in transcript]",
      "time_in_current_location": "[Duration mentioned or inferred from transcript]",
      "profession": "[Professional background mentioned in transcript]"
    },
    "goals": [
      {
        "primary": "[Primary goal extracted from transcript]",
        "secondary": "[Secondary goal extracted from transcript]"
      }
    ],
    "motivations": [
      "[Motivation factor 1]",
      "[Motivation factor 2]",
      "[Motivation factor 3]"
    ],
    "challenges": [
      "[Challenge 1]",
      "[Challenge 2]"
    ],
    "connection_needs": [
      "[Connection need 1]",
      "[Connection need 2]"
    ],
    "skills": [
      "[Skill 1]",
      "[Skill 2]"
    ]
  },
  "inward_profile": {
    "personality_traits": {
      "openness": "[Assessment of openness level] - [Evidence from transcript]",
      "conscientiousness": "[Assessment of conscientiousness level] - [Evidence from transcript]",
      "extraversion": "[Assessment of extraversion level] - [Evidence from transcript]",
      "agreeableness": "[Assessment of agreeableness level] - [Evidence from transcript]",
      "neuroticism": "[Assessment of neuroticism level] - [Evidence from transcript]"
    },
    "communication_style": {
      "clarity": "[Assessment of clarity level] - [Evidence from transcript]",
      "authenticity": "[Assessment of authenticity level] - [Evidence from transcript]",
      "detail_orientation": "[Assessment of detail orientation] - [Evidence from transcript]"
    },
    "psychological_insights": {
      "identity_connection": "[Insight about identity connection]",
      "motivational_drivers": "[Insight about motivational drivers]",
      "growth_mindset": "[Assessment of growth mindset] - [Evidence from transcript]"
    },
    "believability_assessment": {
      "consistency": "[Assessment of narrative consistency] - [Evidence from transcript]",
      "specificity": "[Assessment of detail specificity] - [Evidence from transcript]",
      "emotional_congruence": "[Assessment of emotional congruence] - [Evidence from transcript]"
    },
    "potential_concerns": {
      "concern_area_1": "[Description of potential concern 1]",
      "concern_area_2": "[Description of potential concern 2]"
    },
    "matching_recommendations": {
      "mentor_types": [
        "[Recommended mentor type 1]", 
        "[Recommended mentor type 2]"
      ],
      "peer_types": [
        "[Recommended peer type 1]", 
        "[Recommended peer type 2]"
      ]
    }
  }
}

Focus only on information provided in the transcript. Make reasonable inferences where needed, but do not
invent details not implied by the transcript. Use neutral, balanced language in your assessments.
"""

def analyze_profile(transcript: str, model: str = "o4-mini") -> Dict:
    """
    Analyzes a user transcript to generate a dual-layer profile using the gai_client.
    
    Args:
        transcript: The user's transcribed speech
        model: The model to use for analysis (default: o4-mini)
    
    Returns:
        Dict: The analyzed profile as a dictionary
    """
    try:
        # Call the API with the schema-based approach
        result = gai.openai_text(
            prompt=f"Here is the transcript to analyze:\n\n{transcript}",
            model=model,
            temperature=0.2,
            max_tokens=4000,
            sysmsg=profile_analysis_prompt,
            to_json=True,
            json_schema=user_profile_schema
        )
        
        # Parse the response
        profile_data = json.loads(result)
        return profile_data
        
    except Exception as e:
        # Return an error object if something goes wrong
        return {
            "error": f"Profile analysis failed: {str(e)}",
            "outward_profile": {},
            "inward_profile": {}
        }