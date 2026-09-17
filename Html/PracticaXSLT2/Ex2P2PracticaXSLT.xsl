<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 2) Versió alternativa: per a cada país, inclou nom i població com subelements;
       i el nombre d'idiomes i el nombre de ciutats com atributs (languages i cities) -->
  <xsl:template match="/countries">
    <countries-alt>
      <xsl:for-each select="country">
        <country languages="{count(language)}" cities="{count(city)}">
          <name><xsl:value-of select="@name"/></name>
          <population><xsl:value-of select="@population"/></population>
        </country>
      </xsl:for-each>
    </countries-alt>
  </xsl:template>
</xsl:stylesheet>