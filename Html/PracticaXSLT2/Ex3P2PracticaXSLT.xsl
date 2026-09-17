<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 3) Països on s’ensenya un idioma que acabi amb "ian" -->
  <xsl:template match="/countries">
    <countries-with-ian>
      <xsl:for-each select="country[languages/language[ends-with(., 'ian')]]">
        <country>
          <name><xsl:value-of select="@name"/></name>
          <language>
            <xsl:for-each select="languages/language[ends-with(., 'ian')]">
              <lang><xsl:value-of select="."/></lang>
            </xsl:for-each>
          </language>
        </country>
      </xsl:for-each>
    </countries-with-ian>
  </xsl:template>
</xsl:stylesheet>